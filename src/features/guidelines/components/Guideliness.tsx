'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tooltip, App } from 'antd';
import { FileText, Download, CheckCircle, ShieldAlert } from 'lucide-react';
import { getOfficialDocuments } from '../services/guidelinesApi';
import type { OfficialDocument } from '../types/guidelines.types';
import styles from './Guideliness.module.css';

export const Guideliness: React.FC = () => {
  const { message } = App.useApp();
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);

  useEffect(() => {
    getOfficialDocuments().then((data) => {
      setDocuments(data);
    });
  }, []);

  const handleDownload = (doc: OfficialDocument, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    // Simulate real document download with user feedback
    const blob = new Blob([`${doc.title}\n${doc.description}\nVersion: ${doc.version}\nDate: ${doc.date}`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success(`Downloading ${doc.title}...`);
  };

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Guidelines</h1>
        <p className={styles.pageSubtitle}>
          Turning engineering ideas into real-world, impactful solutions.
        </p>
      </div>

      {/* 2. Official Documents Section */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>Official documents</h2>

        <div className={styles.docsGrid}>
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className={styles.docCard}
              variant="borderless"
              onClick={() => handleDownload(doc)}
            >
              {/* Left File Icon Container */}
              <div className={styles.iconBox}>
                <FileText size={22} strokeWidth={1.8} />
              </div>

              {/* Document Details */}
              <div className={styles.docContent}>
                <div className={styles.titleRow}>
                  <h3 className={styles.docTitle}>{doc.title}</h3>
                  <Tooltip title="Download document">
                    <button
                      type="button"
                      className={styles.downloadBtn}
                      onClick={(e) => handleDownload(doc, e)}
                      aria-label={`Download ${doc.title}`}
                    >
                      <Download size={15} />
                    </button>
                  </Tooltip>
                </div>

                <p className={styles.docDescription}>{doc.description}</p>

                <div className={styles.docMeta}>
                  <span>{doc.version}</span>
                  <span>·</span>
                  <span>{doc.date}</span>
                  <span>·</span>
                  <span>{doc.fileSize}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guideliness;
