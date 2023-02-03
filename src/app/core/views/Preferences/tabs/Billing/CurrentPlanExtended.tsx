import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import notificationsService, { ToastType } from '../../../../../notifications/services/notifications.service';
import paymentService from '../../../../../payment/services/payment.service';
import Card from '../../../../../shared/components/Card';
import Spinner from '../../../../../shared/components/Spinner/Spinner';
import { RootState } from '../../../../../store';
import { useAppDispatch } from '../../../../../store/hooks';
import { PlanState, planThunks } from '../../../../../store/slices/plan';
import CurrentPlanWrapper from '../../components/CurrentPlanWrapper';
import Section from '../../components/Section';

export default function CurrentPlanExtended({ className = '' }: { className?: string }): JSX.Element {
  const plan = useSelector<RootState, PlanState>((state) => state.plan);
  const { translate } = useTranslationContext();

  const userSubscription = plan.subscription;

  let subscriptionExtension:
    | { daysUntilRenewal: string; interval: 'monthly' | 'yearly'; renewDate: string }
    | undefined;

  if (userSubscription?.type === 'subscription') {
    const nextPayment = new Date(userSubscription.nextPayment * 1000);

    const renewDate = Intl.DateTimeFormat(undefined, { dateStyle: 'short' }).format(nextPayment);

    const interval = userSubscription.interval === 'month' ? 'monthly' : 'yearly';

    const daysUntilRenewal = ((nextPayment.valueOf() - new Date().valueOf()) / (1000 * 3600 * 24)).toFixed(0);

    subscriptionExtension = { daysUntilRenewal, interval, renewDate };
  }

  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const dispatch = useAppDispatch();

  async function cancelSubscription() {
    setCancellingSubscription(true);
    try {
      await paymentService.cancelSubscription();
      await dispatch(planThunks.initializeThunk()).unwrap();
      notificationsService.show({ text: translate('notificationMessages.successCancelSubscription') });
    } catch (err) {
      console.error(err);
      notificationsService.show({
        text: translate('notificationMessages.errorCancelSubscription'),
        type: ToastType.Error,
      });
    } finally {
      setCancellingSubscription(false);
    }
  }

  return (
    <Section className={className} title={translate('views.account.tabs.billing.currentPlan')}>
      <Card>
        {plan.planLimit && userSubscription ? (
          <>
            <CurrentPlanWrapper userSubscription={userSubscription} bytesInPlan={plan.planLimit} />
            {subscriptionExtension && (
              <div className="border-translate mt-4 flex flex-col items-center border-gray-5">
                <h1 className="mt-4 font-medium text-gray-80">
                  {translate('views.account.tabs.billing.subsRenew', {
                    daysUntilRenewal: subscriptionExtension.daysUntilRenewal,
                  })}
                </h1>
                <p className="text-xs text-gray-50">
                  {translate('views.account.tabs.billing.billed', {
                    interval:
                      subscriptionExtension.interval === 'monthly'
                        ? translate('general.renewalPeriod.monthly')
                        : translate('general.renewalPeriod.annually'),
                    renewDate: subscriptionExtension.renewDate,
                  })}
                </p>
                <button
                  disabled={cancellingSubscription}
                  onClick={cancelSubscription}
                  className="mt-2 text-xs text-gray-60"
                >
                  {translate('views.account.tabs.billing.cancelSubscription')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center" style={{ height: '122px' }}>
            <Spinner className="h-7 w-7 text-primary" />
          </div>
        )}
      </Card>
    </Section>
  );
}
