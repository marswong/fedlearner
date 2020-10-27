import React, { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button, Divider, Fieldset, Input, Link, Note, Select, Tag, Text, useTheme, useInput } from '@zeit-ui/react';
import { fetcher } from '../libs/http';
import Layout from '../components/Layout';
import { updateMe } from '../services';
import { updateDeployment } from '../services/deployment';

export default function Setting() {
  const theme = useTheme();
  const { state: name, setState: setName, bindings: nameBindings } = useInput('');
  const { data: userData } = useSWR('user', fetcher);
  const user = userData?.data ?? null;
  const { data: deploymentData } = useSWR('deployments/fedlearner-web-console', fetcher);
  const deployment = deploymentData?.data ?? null;
  const { data: activityData } = useSWR('activities', fetcher);
  const activities = activityData?.data?.filter((x) => x.type === 'release') ?? [];
  const version = useMemo(() => deployment?.spec.template.spec.containers[0].image.split(':')[1], [deployment]);
  const versionLink = useMemo(() => `https://github.com/marswong/fedlearner/releases/tag/${version}`, [version]);
  const [customVersion, setCustomVersion] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);

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

  const handleUpdateUser = async () => {
    setUpdatingUser(true);

    try {
      const res = await updateMe({
        ...user,
        name,
      });

      if (res.error) {
        throw new Error(res.error);
      }
    } catch (err) {
      setNameError(err.message);
    }

    setUpdatingUser(false);
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  return (
    <Layout>
      <Text h2>Settings</Text>
      <Text>Common settings of Web Console and your account</Text>

      <Divider />

      {/* Version */}
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

      {/* Name */}
      <Fieldset style={{ marginTop: theme.layout.gap }}>
        <Fieldset.Title>
          Your Name
        </Fieldset.Title>
        <Fieldset.Subtitle>
          Please enter your full name, or a display name you are comfortable with.
        </Fieldset.Subtitle>

        {user && <Input {...nameBindings} />}

        <Fieldset.Footer>
          <Fieldset.Footer.Status>
            {nameError
              ? <Note small label="error" type="error">{nameError}</Note>
              : <Text p>Please use 200 characters at maximum.</Text>}
          </Fieldset.Footer.Status>
          <Fieldset.Footer.Actions>
            <Button auto loading={updatingUser} type="secondary" onClick={handleUpdateUser}>
              Save
            </Button>
          </Fieldset.Footer.Actions>
        </Fieldset.Footer>
      </Fieldset>

      {/* add account settings here */}
    </Layout>
  );
}
