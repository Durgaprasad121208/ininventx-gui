'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InputNumber, App } from 'antd';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import {
  getSettings,
  saveProgrammeRules,
  saveJudgingCriteria,
} from '../services/settingsApi';
import type { ProgrammeRules, JudgingCriterion } from '../types/settings.types';
import styles from './Settings.module.css';

export const Settings: React.FC = () => {
  const { message } = App.useApp();

  const [rules, setRules] = useState<ProgrammeRules>({
    maxIdeasPerUser: 5,
    maxTeamSize: 4,
  });
  const [criteria, setCriteria] = useState<JudgingCriterion[]>([]);
  const [savingCriteria, setSavingCriteria] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setRules(data.programmeRules);
      setCriteria(data.judgingCriteria);
    });
  }, []);

  const totalWeight = useMemo(() => {
    return criteria.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  }, [criteria]);

  const handleRuleChange = (field: keyof ProgrammeRules, value: number | null) => {
    const val = value || 1;
    setRules((prev) => ({ ...prev, [field]: val }));
    saveProgrammeRules({ ...rules, [field]: val }).then(() => {
      message.success(`Updated ${field === 'maxIdeasPerUser' ? 'max ideas' : 'max team size'} to ${val}`);
    });
  };

  const handleCriterionWeightChange = (id: string, newWeight: number | null) => {
    const w = typeof newWeight === 'number' ? newWeight : 0;
    setCriteria((prev) =>
      prev.map((item) => (item.id === id ? { ...item, weight: w } : item))
    );
  };

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      message.error(`Weights must total exactly 100%. Current total is ${totalWeight}%.`);
      return;
    }

    setSavingCriteria(true);
    try {
      await saveJudgingCriteria(criteria);
      message.success('Judging criteria weights updated successfully');
    } catch {
      message.error('Failed to save judging criteria weights');
    } finally {
      setSavingCriteria(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <span className={styles.topRoleTag}>ORGANIZER</span>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      {/* 2. Card 1: Programme Rules */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Programme rules</h2>
          <p className={styles.cardSubtitle}>
            Displayed in the UI; the backend must enforce the same limits transactionally.
          </p>
        </div>

        <div className={styles.rulesGrid}>
          <div className={styles.ruleBox}>
            <label className={styles.ruleLabel}>Max ideas per user</label>
            <InputNumber
              min={1}
              max={50}
              value={rules.maxIdeasPerUser}
              onChange={(val) => handleRuleChange('maxIdeasPerUser', val)}
              className={styles.ruleInput}
              controls={false}
            />
          </div>

          <div className={styles.ruleBox}>
            <label className={styles.ruleLabel}>Max team size (incl. owner)</label>
            <InputNumber
              min={1}
              max={20}
              value={rules.maxTeamSize}
              onChange={(val) => handleRuleChange('maxTeamSize', val)}
              className={styles.ruleInput}
              controls={false}
            />
          </div>
        </div>
      </div>

      {/* 3. Card 2: Judging Criteria */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Judging criteria</h2>
          <p className={styles.cardSubtitle}>Weights must total 100%.</p>
        </div>

        <div className={styles.criteriaList}>
          {criteria.map((item) => (
            <div key={item.id} className={styles.criterionRow}>
              <div className={styles.criterionLabelBox}>
                <span>{item.label}</span>
              </div>
              <div className={styles.criterionWeightWrapper}>
                <InputNumber
                  min={0}
                  max={100}
                  value={item.weight}
                  onChange={(val) => handleCriterionWeightChange(item.id, val)}
                  suffix="%"
                  className={styles.criterionWeightInput}
                  controls={false}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.criteriaFooter}>
          <div
            className={`${styles.totalText} ${
              totalWeight === 100 ? styles.totalSuccess : styles.totalError
            }`}
          >
            Total {totalWeight}%
          </div>

          <SubmitButton
            onClick={handleSaveWeights}
            loading={savingCriteria}
          >
            Save weights
          </SubmitButton>
        </div>
      </div>
    </div>
  );
};

export default Settings;
