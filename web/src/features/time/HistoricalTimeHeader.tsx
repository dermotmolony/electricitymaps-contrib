import { Button } from 'components/Button';
import {
  NewFeaturePopover,
  POPOVER_ID,
} from 'components/NewFeaturePopover/NewFeaturePopover';
import { NewFeaturePopoverContent } from 'components/NewFeaturePopover/NewFeaturePopoverContent';
import { FormattedTime } from 'components/Time';
import { useFeatureFlag } from 'features/feature-flags/api';
import { useAtomValue } from 'jotai';
import { ArrowRightToLine, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { RouteParameters } from 'types';
import trackEvent from 'utils/analytics';
import { MAX_HISTORICAL_LOOKBACK_DAYS, TrackEvent } from 'utils/constants';
import { useNavigateWithParameters } from 'utils/helpers';
import { endDatetimeAtom, isHourlyAtom, startDatetimeAtom } from 'utils/state/atoms';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export default function HistoricalTimeHeader() {
  const { i18n } = useTranslation();
  const startDatetime = useAtomValue(startDatetimeAtom);
  const endDatetime = useAtomValue(endDatetimeAtom);
  const isHourly = useAtomValue(isHourlyAtom);
  const { urlDatetime } = useParams<RouteParameters>();
  const navigate = useNavigateWithParameters();
  const isNewFeaturePopoverEnabled = useFeatureFlag(POPOVER_ID);

  const isWithinHistoricalLimit = useMemo(() => {
    if (!urlDatetime) {
      return true;
    }

    const targetDate = new Date(urlDatetime);
    targetDate.setUTCHours(targetDate.getUTCHours() - 24);

    const maxHistoricalDate = new Date();
    maxHistoricalDate.setUTCDate(
      maxHistoricalDate.getUTCDate() - MAX_HISTORICAL_LOOKBACK_DAYS
    );

    return targetDate >= maxHistoricalDate;
  }, [urlDatetime]);

  function handleRightClick() {
    if (!endDatetime || !urlDatetime) {
      return;
    }
    trackEvent(TrackEvent.HISTORICAL_NAVIGATION, {
      direction: 'forward',
    });
    const currentEndDatetime = new Date(endDatetime);
    const newDate = new Date(currentEndDatetime.getTime() + TWENTY_FOUR_HOURS);

    const twentyFourHoursAgo = new Date(Date.now() - TWENTY_FOUR_HOURS);
    if (newDate >= twentyFourHoursAgo) {
      navigate({ datetime: '' });
      return;
    }
    navigate({ datetime: newDate.toISOString() });
  }

  function handleLeftClick() {
    if (!endDatetime || !isWithinHistoricalLimit) {
      return;
    }
    trackEvent(TrackEvent.HISTORICAL_NAVIGATION, {
      direction: 'backward',
    });
    const currentEndDatetime = new Date(endDatetime);
    const newDate = new Date(currentEndDatetime.getTime() - TWENTY_FOUR_HOURS);
    navigate({ datetime: newDate.toISOString() });
  }

  if (!isHourly && startDatetime && endDatetime) {
    return (
      <div className="flex min-h-6 flex-row items-center justify-center">
        <FormattedTime
          datetime={startDatetime}
          language={i18n.languages[0]}
          endDatetime={endDatetime}
          className="text-sm font-semibold"
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-6 w-full items-center">
      <div className="absolute flex w-full items-center justify-between px-10">
        <NewFeaturePopover
          side="top"
          content={<NewFeaturePopoverContent />}
          isOpenByDefault={isNewFeaturePopoverEnabled}
        >
          <Button
            backgroundClasses="bg-transparent"
            onClick={handleLeftClick}
            size="sm"
            type="tertiary"
            isDisabled={!isWithinHistoricalLimit}
            icon={
              <ChevronLeft
                size={22}
                className={twMerge(
                  'text-brand-green dark:text-success-dark',
                  !isWithinHistoricalLimit && 'opacity-50'
                )}
              />
            }
          />
        </NewFeaturePopover>
        {startDatetime && endDatetime && (
          <FormattedTime
            datetime={startDatetime}
            language={i18n.languages[0]}
            endDatetime={endDatetime}
            className="text-sm font-semibold"
          />
        )}
        <Button
          backgroundClasses="bg-transparent"
          size="sm"
          onClick={handleRightClick}
          type="tertiary"
          isDisabled={!urlDatetime}
          icon={
            <ChevronRight
              className={twMerge(
                'text-brand-green dark:text-success-dark',
                !urlDatetime && 'opacity-50'
              )}
              size={22}
            />
          }
        />
      </div>
      <Button
        backgroundClasses="absolute z-1 right-2"
        size="sm"
        type="tertiary"
        onClick={() => {
          trackEvent(TrackEvent.HISTORICAL_NAVIGATION, {
            direction: 'latest',
          });
          navigate({ datetime: '' });
        }}
        isDisabled={!urlDatetime}
        icon={
          <ArrowRightToLine
            className={twMerge(
              'text-brand-green dark:text-success-dark',
              !urlDatetime && 'opacity-50'
            )}
            size={22}
          />
        }
      />
    </div>
  );
}
