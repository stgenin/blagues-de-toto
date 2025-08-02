import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Textfield, Form, Button } from '@forge/react';
import { invoke } from '@forge/bridge';
const App = () => {
  const [customField, setCustomField] = useState(null);
  const [openAPIKey, setOpenAPIKey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ customField: '', openAPIKey: '' });

useEffect(() => {
    const fetchData = async () => {
      const cf = await invoke('getCFValue', { example: 'my-invoke-variable' });
      const key = await invoke('getAPIKeyValue', { example: 'my-invoke-variable' });
      setCustomField(cf);
      setOpenAPIKey(key);
      setFormData({ customField: cf, openAPIKey: key });
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (isEditing) {
      await invoke('saveParams', {
        customField: formData.customField,
        openAPIKey: formData.openAPIKey,
      });
      setCustomField(formData.customField);
      setOpenAPIKey(formData.openAPIKey);
    }
    setIsEditing(!isEditing);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
      {isEditing ? (
        <>
          <Text>CustomField : </Text>
          <Textfield
            label="CustomField"
            value={formData.customField}
            onChange={(e) => setFormData({ ...formData, customField: e.target.value })}
          />
          <Text>OpenAPI Key : </Text>
          <Textfield
            label="OpenAPI Key"
            type="password"
            value={formData.openAPIKey}
            onChange={(e) => setFormData({ ...formData, openAPIKey: e.target.value })}
          />
        </>
      ) : (
        <>
          <Text>CustomField : {customField ?? 'Loading...'}</Text>
          <Text>OpenAPI Key : {openAPIKey ? '*'.repeat(openAPIKey.length) : 'Loading...'}</Text>
        </>
      )}
      <Button appearance="primary" type="submit">
        {isEditing ? 'Save' : 'Edit'}
      </Button>
      </Form>
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
