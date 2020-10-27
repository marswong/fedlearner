import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Button, Divider, Fieldset, Link, Note, Select, Tag, Text, useTheme } from '@zeit-ui/react';
import { fetcher } from '../libs/http';
import Layout from '../components/Layout';
import { updateDeployment } from '../services/deployment';

export default function Setting() {
  const theme = useTheme();
  const { data: deploymentData } = useSWR('deployments/fedlearner-web-console', fetcher);
  const deployment = deploymentData?.data ?? null;
  const { data: activityData } = useSWR('activities', fetcher);
  const activities = activityData?.data.filter((x) => x.type === 'release') ?? [];
  const version = useMemo(() => deployment?.spec.template.spec.containers[0].image.split(':')[1], [deployment]);
  const versionLink = useMemo(() => `https://github.com/marswong/fedlearner/releases/tag/${version}`, [version]);
  const [customVersion, setCustomVersion] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setUpgrading(true);

    try {
      deployment.spec.template.spec.containers[0].image = `marswong/fedlearner-web-console-test:${customVersion}`;
      const res = await updateDeployment(deployment);

      if (res.error) {
        throw new Error(res.error);
      }
    } catch (err) {
      setError(err.message);
    }

    setUpgrading(false);
  };

  return (
    <Layout>
      <Text h2>Settings</Text>
      <Text>Common settings of Web Console and your account</Text>

      <Divider />

      <Fieldset>
        <Fieldset.Title>
          Web Console Version
          <Tag style={{ marginLeft: theme.layout.gapHalf }}>
            <Link href={versionLink} target="_blank" rel="noopenner noreferer">
              Current: {version}
            </Link>
          </Tag>
        </Fieldset.Title>
        <Fieldset.Subtitle>
          Please select version to upgrade below.
        </Fieldset.Subtitle>

        <Select initialValue={version} value={customVersion} onChange={setCustomVersion}>
          {activities.map((x) => (
            <Select.Option key={x.ctx.docker.name} value={x.ctx.docker.name}>{x.ctx.docker.name}</Select.Option>
          ))}
        </Select>

        <Fieldset.Footer>
          <Fieldset.Footer.Status>
            {error
              ? <Note small label="error" type="error">{error}</Note>
              : <Text p>Web Console would be upgraded, and make sure to save your data first.</Text>}
          </Fieldset.Footer.Status>
          <Fieldset.Footer.Actions>
            <Button auto disabled={!customVersion} loading={upgrading} type="secondary" onClick={handleUpgrade}>
              Upgrade
            </Button>
          </Fieldset.Footer.Actions>
        </Fieldset.Footer>
      </Fieldset>

      {/* add account settings here */}
    </Layout>
  );
}
