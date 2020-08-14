import React from 'react';
import css from 'styled-jsx/css';
import { Avatar, Link, Text, useTheme } from '@zeit-ui/react';
import { humanizeDuration } from '../utils/time';

function useStyles(theme) {
  return css`
    .event {
      display: flex;
      align-items: center;
      padding: 10px 0px;
      border-bottom: 1px solid ${theme.palette.accents_2};
      font-size: 14px;
    }

    .message {
      margin: 0;
      flex: 1;
    }

    .created {
      color: rgb(153, 153, 153) !important;
      margin: 0 0 0 auto;
      padding-left: 10px;
      text-align: right;
    }
  `;
}

export default function EventListItem({ event }) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { type, meta, creator, created_at } = event;

  return (
    <div className="event">
      <Avatar
        src={creator.avatar_url}
        alt={`${creator.name} Avatar`}
      />
      {type === 'release' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '0 0 0 10px' }}>
          <Text b>
            <Link href={creator.github_url} target="_blank" rel="noopenner noreferer">{creator.name}</Link>
          </Text>
          <Text style={{ margin: '0 4px' }}>releases version</Text>
          <Text b>
            <Link href={meta.commit_url} target="_blank" rel="noopenner noreferer">{meta.version}</Link>
          </Text>
        </div>
      )}
      <Text type="secondary">{humanizeDuration(created_at)}</Text>
      <style jsx>{styles}</style>
    </div>
  );
}
