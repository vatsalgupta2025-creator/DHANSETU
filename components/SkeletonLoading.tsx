'use client';
import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
    style?: React.CSSProperties;
}

export function Skeleton({ className = '', width, height, circle = false, style }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`}
            style={{
                width: width,
                height: height,
                ...style,
            }}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={className}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="1em"
                    width={i === lines - 1 ? '60%' : '100%'}
                    className="skeleton-text"
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 20,
            transition: 'all 0.3s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Skeleton width={48} height={48} circle />
                <div style={{ flex: 1 }}>
                    <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width="40%" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{
                display: 'flex', gap: 16, padding: '12px 0',
                borderBottom: '1px solid var(--border)',
            }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} height={14} width={`${15 + Math.random() * 10}%`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} style={{
                    display: 'flex', gap: 16, padding: '16px 0',
                    borderBottom: '1px solid var(--border)',
                }}>
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                        <Skeleton key={colIndex} height={12} width={`${15 + Math.random() * 10}%`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonKPI({ count = 4 }: { count?: number }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${count}, 1fr)`,
            gap: 16,
        }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 20,
                    transition: 'all 0.3s ease',
                }}>
                    <Skeleton height={12} width="40%" style={{ marginBottom: 12 }} />
                    <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width="30%" />
                </div>
            ))}
        </div>
    );
}

export function PageLoader() {
    return (
        <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-base)',
            zIndex: 9999,
        }}>
            <div className="spinner" style={{ marginBottom: 20 }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Loading dashboard...
            </div>
        </div>
    );
}

export function ContentLoader() {
    return (
        <div style={{ padding: '20px 0' }}>
            <SkeletonKPI count={4} />
            <div style={{ marginTop: 24 }}>
                <Skeleton height={400} style={{ borderRadius: 16 }} />
            </div>
        </div>
    );
}

export default {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonTable,
    SkeletonKPI,
    PageLoader,
    ContentLoader,
};
