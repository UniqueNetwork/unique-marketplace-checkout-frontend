import { useCallback, useEffect, useState } from 'react';
import { TTransaction } from '../api/chainApi/types';
import { InternalStage, SignFunction, StageStatus, useStagesReturn } from '../types/StagesTypes';
import { useNotification } from './useNotification';
import { NotificationSeverity } from '../notification/NotificationContext';

const useStages = <T>(stages: InternalStage<T>[], signFunction: SignFunction): useStagesReturn<T> => {
  const [internalStages, setInternalStages] = useState<InternalStage<T>[]>(stages);
  const [stagesStatus, setStagesStatus] = useState<StageStatus>(StageStatus.default);
  const [executionError, setExecutionError] = useState<Error | undefined | null>(null);
  const { push } = useNotification();

  useEffect(() => {
    setInternalStages(stages);
  }, [stages]);

  useEffect(() => {
    return () => {
      internalStages?.forEach((internalStage) => internalStage?.signer?.onError(new Error('Componen\'t unmounted')));
    };
  }, [internalStages]);

  const updateStage = useCallback((index: number, newStage: InternalStage<T>) => {
    setInternalStages((stages) => {
      const copy = [...stages];
      copy[index] = newStage;
      return copy;
    });
  }, [setInternalStages]);

  const getSignFunction = useCallback((index: number, internalStage: InternalStage<T>) => {
    const sign = async (tx: TTransaction): Promise<TTransaction> => {
      updateStage(index, { ...internalStage, status: StageStatus.awaitingSign });
      const signedTx = await signFunction(tx);
      updateStage(index, { ...internalStage, status: StageStatus.inProgress });
      return signedTx;
    };
    return sign;
  }, [updateStage, signFunction]);

  const executeStep = useCallback(async (stage: InternalStage<T>, index: number, txParams: T) => {
    updateStage(index, { ...stage, status: StageStatus.inProgress });
    try {
      // if sign is required by action -> promise wouldn't be resolved until transaction is signed
      // transaction sign could be triggered in the component that uses current stage (you can track it by using stage.signer)
      await stage.action({ txParams, options: { sign: getSignFunction(index, stage) } });
      // await actionFunction(stage.action, txParams, { sign: getSignFunction(index, stage) });
      updateStage(index, { ...stage, status: StageStatus.success });
    } catch (e) {
      updateStage(index, { ...stage, status: StageStatus.error });
      console.error('Execute stage failed', stage, e);
      throw new Error(`Execute stage "${stage.title}" failed`);
    }
  }, [updateStage, getSignFunction]);

  const initiate = useCallback(async (params: T) => {
    setStagesStatus(StageStatus.inProgress);
    for (const [index, internalStage] of internalStages.entries()) {
      try {
        await executeStep(internalStage, index, params);
      } catch (e) {
        setStagesStatus(StageStatus.error);
        setExecutionError(new Error(`Stage "${internalStage.title}" failed`));
        push({ severity: NotificationSeverity.error, message: `Stage "${internalStage.title}" failed` });
        return;
      }
    }
    setStagesStatus(StageStatus.success);
  }, [executeStep, internalStages]);

  return {
    // we don't want our components to know or have any way to interact with stage.actions, everything else is fine
    // TODO: consider to split them apart like InternalStages = [{ stage, action }, ...] instead
    stages: internalStages.map((internalStage: InternalStage<T>) => {
      const { action, ...other } = internalStage;
      return {
        ...other
      };
    }),
    error: executionError,
    status: stagesStatus,
    initiate
  };
};

export default useStages;
