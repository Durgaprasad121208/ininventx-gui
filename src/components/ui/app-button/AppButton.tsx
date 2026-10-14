'use client';

import React from 'react';
import { Button as AntButton, ButtonProps } from 'antd';
import styles from './AppButton.module.css';

export interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
    /** Visual style variant */
    variant?: 'submit' | 'cancel' | 'primary' | 'secondary' | 'dark';
}

/**
 * SubmitButton - Primary action button component (Theme Brand #29c9d1)
 */
export const SubmitButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
    return (
        <AntButton
            type="primary"
            {...props}
            className={`${styles.submitBtn} ${className}`.trim()}
        />
    );
};

/**
 * CancelButton - Secondary / Cancel action button component
 */
export const CancelButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
    return (
        <AntButton
            {...props}
            className={`${styles.cancelBtn} ${className}`.trim()}
        />
    );
};

/**
 * DarkButton - Neutral / Dark button with subtle border
 */
export const DarkButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
    return (
        <AntButton
            {...props}
            className={`${styles.darkBtn} ${className}`.trim()}
        />
    );
};

/**
 * AppButton - Unified button supporting variants: submit, cancel, dark, primary, secondary
 */
export const AppButton: React.FC<AppButtonProps> = ({
    variant = 'primary',
    className = '',
    ...props
}) => {
    if (variant === 'cancel' || variant === 'secondary') {
        return <CancelButton className={className} {...props} />;
    }
    if (variant === 'dark') {
        return <DarkButton className={className} {...props} />;
    }
    return <SubmitButton className={className} {...props} />;
};

export default SubmitButton;
