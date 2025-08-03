import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Form,
  FormFooter,
  Box,
  Inline,
  Text,
  Textfield,
  Button,
  xcss,
  Table,
  Row,
  Cell,
  Image,
} from '@forge/react';
import { invoke } from '@forge/bridge';
import logo from './BlaguesDeToto.png';

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
    display: 'flex',
    alignItems: 'center',
    maxWidth: '500px',
    marginInlineStart: 'auto',
    marginInlineEnd: 'auto',
    justifyContent: 'center',
    padding: 'space.150'
  });

  const rowStyle = xcss({
    display: 'grid',
    gap: 'space.100'
  });

  const cellInline = {
    alignBlock: 'center',
    space: 'space.050'
  };

  const container = xcss({
    maxWidth: "500px",
    marginInlineStart: "auto",
    marginInlineEnd: "auto",
    padding: "space.150",
  });

  const tableCss = xcss({
    width: "100%",
    border: "none", // simplifie le rendu
  });

  const cellLabel = xcss({
    fontWeight: "bold",
    width: "40%",
  });

  const cellValue = xcss({
    width: "60%",
  });

  const headerImageStyle = xcss({
    width: '100%',
    maxWidth: '250px',
    marginBlockEnd: 'space.150',
  });

    return (
    <Box xcss={containerStyle}>
      <Image
        src={logo} alt="Image d'illustration"
        xcss={headerImageStyle}
      />

      <Form onSubmit={handleSubmit}>
        {/* Ligne CustomField */}
        <Inline xcss={rowStyle}>
          <Box xcss={cellLabel}>
            <Text>ID du customField :</Text>
          </Box>
          <Box xcss={cellValue}>
            {isEditing ? (
              <Textfield
                defaultValue={formData.customField}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, customField: e.target.value }))
                }
              />
            ) : (
              <Text>{customField || '—'}</Text>
            )}
          </Box>
        </Inline>

        {/* Ligne Clé OpenAI */}
        <Inline xcss={rowStyle}>
          <Box xcss={cellLabel}>
            <Text>Clé OpenAI :</Text>
          </Box>
          <Box xcss={cellValue}>
            {isEditing ? (
              <Textfield
                type="password"
                defaultValue={formData.openAPIKey}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, openAPIKey: e.target.value }))
                }
              />
            ) : (
              <Text>{openAPIKey ? '•'.repeat(openAPIKey.length) : '—'}</Text>
            )}
          </Box>
        </Inline>

        <FormFooter align="end" marginTop="space.150">
          <Button appearance="primary" type="submit">
            {isEditing ? 'Enregistrer' : 'Modifier'}
          </Button>
        </FormFooter>
      </Form>
    </Box>
  );
};

ForgeReconciler.render(<App />);
