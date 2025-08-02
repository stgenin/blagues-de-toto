import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Form,
  FormFooter,
  Box,
  Inline,
  Text,
  Textfield,
  Button,
  xcss
} from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [customField, setCustomField] = useState('');
  const [openAPIKey, setOpenAPIKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ customField: '', openAPIKey: '' });

  useEffect(() => {
    (async () => {
      const cf = await invoke('getCFValue');
      const key = await invoke('getAPIKeyValue');
      setCustomField(cf || '');
      setOpenAPIKey(key || '');
      setFormData({ customField: cf || '', openAPIKey: key || '' });
    })();
  }, []);

  const handleSubmit = async () => {
    if (isEditing) {
      await invoke('saveParams', {
        customField: formData.customField,
        openAPIKey: formData.openAPIKey
      });
      setCustomField(formData.customField);
      setOpenAPIKey(formData.openAPIKey);
    }
    setIsEditing(prev => !prev);
  };

  const containerStyle = xcss({
    maxWidth: '500px',
    marginInlineStart: 'auto',
    marginInlineEnd: 'auto',
    padding: 'space.150'
  });

  const rowStack = xcss({
    display: 'grid',
    gap: 'space.100'
  });

  const cellInline = {
    alignBlock: 'center',
    space: 'space.050'
  };

  return (
    <Box xcss={containerStyle}>
      <Form onSubmit={handleSubmit}>
        <Box xcss={rowStack}>
          <Inline {...cellInline}>
            <Text>CustomField:&nbsp;</Text>
            {isEditing ? (
              <Textfield
                defaultValue={formData.customField}
                onChange={e => setFormData({ ...formData, customField: e.target.value })}
              />
            ) : (
              <Text>{customField || 'Loading...'}</Text>
            )}
          </Inline>

          <Inline {...cellInline}>
            <Text>OpenAPI Key:&nbsp;</Text>
            {isEditing ? (
              <Textfield
                type="password"
                defaultValue={formData.openAPIKey}
                onChange={e => setFormData({ ...formData, openAPIKey: e.target.value })}
              />
            ) : (
              <Text>{openAPIKey ? '•'.repeat(openAPIKey.length) : 'Loading...'}</Text>
            )}
          </Inline>
        </Box>

        <FormFooter align="end">
          <Button appearance="primary" type="submit">
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </FormFooter>
      </Form>
    </Box>
  );
};

ForgeReconciler.render(<App />);
