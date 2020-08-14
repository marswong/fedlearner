import React, { useMemo, useEffect, useState } from 'react';
import css from 'styled-jsx/css';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Button, Card, Text, Link, useTheme } from '@zeit-ui/react';
import FolderPlusIcon from '@zeit-ui/react-icons/folderPlus';
import { fetcher } from '../libs/http';
import Layout from '../components/Layout';
import EventListItem from '../components/EventListItem';
import JobCard from '../components/JobCard';

const EVENTS = [
  {
    id: 1,
    type: 'release',
    meta: {
      version: '10afeb0',
      sha: '10afeb06c0c6ec37bae5aaf6eaefff7bcddf4ef1',
      commit_url: 'https://github.com/bytedance/fedlearner/commit/10afeb0',
      message: 'add the grpc options for etcd client (#243)\n\n* add the grpc options for etcd\r\n\r\n* make lint pass\r\n\r\n* more large generated psi output file size\r\n\r\n* more oom check for rsa psi processor\r\n\r\nCo-authored-by: fangchenliaohui <fangchenliaohui@bytedance.com>',
    },
    creator: {
      name: 'fclh',
      email: 'fclh1991@gmail.com',
      github_username: 'fclh1991',
      github_url: 'https://github.com/fclh1991',
      avatar_url: 'https://avatars3.githubusercontent.com/u/4548685?v=4',
    },
    created_at: '2020-08-13T08:08:31Z',
  },
  {
    id: 2,
    type: 'release',
    meta: {
      version: '10afeb0',
      sha: '10afeb06c0c6ec37bae5aaf6eaefff7bcddf4ef1',
      commit_url: 'https://github.com/bytedance/fedlearner/commit/10afeb0',
      message: 'add the grpc options for etcd client (#243)\n\n* add the grpc options for etcd\r\n\r\n* make lint pass\r\n\r\n* more large generated psi output file size\r\n\r\n* more oom check for rsa psi processor\r\n\r\nCo-authored-by: fangchenliaohui <fangchenliaohui@bytedance.com>',
    },
    creator: {
      name: 'fclh',
      email: 'fclh1991@gmail.com',
      github_username: 'fclh1991',
      github_url: 'https://github.com/fclh1991',
      avatar_url: 'https://avatars3.githubusercontent.com/u/4548685?v=4',
    },
    created_at: '2020-08-13T08:08:31Z',
  },
  {
    id: 3,
    type: 'release',
    meta: {
      version: '10afeb0',
      sha: '10afeb06c0c6ec37bae5aaf6eaefff7bcddf4ef1',
      commit_url: 'https://github.com/bytedance/fedlearner/commit/10afeb0',
      message: 'add the grpc options for etcd client (#243)\n\n* add the grpc options for etcd\r\n\r\n* make lint pass\r\n\r\n* more large generated psi output file size\r\n\r\n* more oom check for rsa psi processor\r\n\r\nCo-authored-by: fangchenliaohui <fangchenliaohui@bytedance.com>',
    },
    creator: {
      name: 'fclh',
      email: 'fclh1991@gmail.com',
      github_username: 'fclh1991',
      github_url: 'https://github.com/fclh1991',
      avatar_url: 'https://avatars3.githubusercontent.com/u/4548685?v=4',
    },
    created_at: '2020-08-13T08:08:31Z',
  },
  {
    id: 4,
    type: 'release',
    meta: {
      version: '10afeb0',
      sha: '10afeb06c0c6ec37bae5aaf6eaefff7bcddf4ef1',
      commit_url: 'https://github.com/bytedance/fedlearner/commit/10afeb0',
      message: 'add the grpc options for etcd client (#243)\n\n* add the grpc options for etcd\r\n\r\n* make lint pass\r\n\r\n* more large generated psi output file size\r\n\r\n* more oom check for rsa psi processor\r\n\r\nCo-authored-by: fangchenliaohui <fangchenliaohui@bytedance.com>',
    },
    creator: {
      name: 'fclh',
      email: 'fclh1991@gmail.com',
      github_username: 'fclh1991',
      github_url: 'https://github.com/fclh1991',
      avatar_url: 'https://avatars3.githubusercontent.com/u/4548685?v=4',
    },
    created_at: '2020-08-13T08:08:31Z',
  },
  {
    id: 5,
    type: 'release',
    meta: {
      version: '10afeb0',
      sha: '10afeb06c0c6ec37bae5aaf6eaefff7bcddf4ef1',
      commit_url: 'https://github.com/bytedance/fedlearner/commit/10afeb0',
      message: 'add the grpc options for etcd client (#243)\n\n* add the grpc options for etcd\r\n\r\n* make lint pass\r\n\r\n* more large generated psi output file size\r\n\r\n* more oom check for rsa psi processor\r\n\r\nCo-authored-by: fangchenliaohui <fangchenliaohui@bytedance.com>',
    },
    creator: {
      name: 'fclh',
      email: 'fclh1991@gmail.com',
      github_username: 'fclh1991',
      github_url: 'https://github.com/fclh1991',
      avatar_url: 'https://avatars3.githubusercontent.com/u/4548685?v=4',
    },
    created_at: '2020-08-13T08:08:31Z',
  },
];

function useStyles(theme) {
  return css`
    .row {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      position: relative;
      min-width: 1px;
      max-width: 100%;
      margin-bottom: ${theme.layout.pageMargin};
    }

    .jobs {
      width: 100%;
    }

    .createJobContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 8px !important;
      min-height: 135px;
      border: 1px dashed #000;
      border-radius: 8px;
    }

    .createJobContainer span {
      margin-top: 10px;
      font-size: 14px;
      line-height: 24px;
    }

    .activity {
      flex: 1;
    }

    @media screen and (min-width: ${theme.layout.pageWidthWithMargin}) {
      .row {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .jobs {
        width: 540px;
        max-width: 100%;
        margin-right: 80px;
      }
    }
  `;
}

export default function Overview() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const router = useRouter();
  const [options] = useMemo(() => ({
    searchParams: { offset: 0, limit: 10 },
  }));
  const events = useMemo(() => EVENTS);
  const [max, setMax] = useState(10);
  const { data } = useSWR(['jobs', options], fetcher);
  const jobs = data?.data.filter((x) => x.metadata).slice(0, max) ?? [];
  const goToJob = () => router.push('/datasource/job');

  useEffect(() => {
    // tips: make content fit in one page for different resolution with `max`
    const count = Math.floor((window.innerHeight - 48 - 60 - 62 - 66) / 173.267);
    if (count < max) {
      setMax(count);
    }
  });

  return (
    <Layout>
      <div className="heading">
        <Text h2>Pending Jobs</Text>
        <Button auto type="secondary" onClick={goToJob}>Create Job</Button>
      </div>
      <div className="row">
        <div className="jobs">
          {jobs.length > 0 && jobs.map((x, i) => (
            <JobCard
              key={x.localdata.id}
              job={x}
              style={i > 0 ? { marginTop: theme.layout.gap } : {}}
            />
          ))}
          {jobs.length > 0 && (
            <Text>
              <Link className="colorLink" href="/job" color>View All Jobs</Link>
            </Text>
          )}
          {jobs.length === 0 && (
            <Card shadow style={{ cursor: 'pointer' }} onClick={goToJob}>
              <div className="createJobContainer">
                <FolderPlusIcon size={28} />
                <span>Create Job</span>
              </div>
            </Card>
          )}
        </div>
        <div className="activity">
          <Text h4>Recent Activity</Text>
          {events.map((x) => <EventListItem key={x.id} event={x} />)}
          <Text>
            <Link className="colorLink" href="/activity" color>View All Activity</Link>
          </Text>
        </div>
      </div>

      <style jsx>{styles}</style>
    </Layout>
  );
}
