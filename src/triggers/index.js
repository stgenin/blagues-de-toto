import api, { route } from '@forge/api';
import { kvs } from '@forge/kvs';

export async function issueCreatedHandler (event, context) {
  console.log('Issue created event:', event.issue.key, 'project:', event.issue.fields.project.key);

  const customFieldValue = await getCustomFieldValue();
  const openAPIKey = await getAPIKeyValue();
  console.log('La valeur du customfield est ' + customFieldValue);
  console.log('La valeur de la clé API est ' + openAPIKey);

  await updateTextAreaField(event.issue.key, customFieldValue, textToADF("Mise à jour du champ texte"))

  // Exemple d'action automatique : ajouter un label "NewTask" si absent
  /* const labels = event.issue.fields.labels || [];
  if (!labels.includes('NewTask')) {
    await api.asApp().requestJira(
      route`/rest/api/3/issue/${event.issue.key}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { labels: [...labels, 'NewTask'] } })
      }
    );
    console.log('Label ajouté à la demande');

  }
    */
  return true;
}

const getCustomFieldValue = async () => {
  try {
      const stored = await kvs.get('customField');
      if (stored === undefined) {
        return 'undefined';
      }
      return stored;
  } catch (err) {
    // Certains cas exceptionnels (e.g. key invalide, quota atteint)
    // kvs.get peut jeter si invalidité de la clé ou limite atteinte
    // Lorsque api retourne NOT_FOUND dans l'en-tête, ne pas propager
    const errCode = err?.code || err?.error?.code;
    if (errCode === 'NOT_FOUND') {
      return 'undefined';
    }
    throw err;
  }
}

const getAPIKeyValue = async () => {
  try {
      const stored = await kvs.getSecret('openAPIKey');
      if (stored === undefined) {
        return 'undefined';
      }
      return stored;
  } catch (err) {
    // Certains cas exceptionnels (e.g. key invalide, quota atteint)
    // kvs.get peut jeter si invalidité de la clé ou limite atteinte
    // Lorsque api retourne NOT_FOUND dans l'en-tête, ne pas propager
    const errCode = err?.code || err?.error?.code;
    if (errCode === 'NOT_FOUND') {
      return 'undefined';
    }
    throw err;
  }
}

async function updateTextAreaField(issueKey, customFieldId, textareaValue) {
  const response = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          [customFieldId]: textareaValue
        }
      })
    }
  );
  if (!response.ok) {
    const err = await response.text();
    console.error('Erreur updateCustomField:', response.status, err);
    throw new Error(`PUT /issue/${issueKey} -> ${response.status}`);
  }
  console.log('champ multi‑ligne mis à jour sur', issueKey);
}

function textToADF(text) {
  return {
    version: 1,
    type: "doc",
    content: text.split(/\r?\n/).map(line => ({
      type: "paragraph",
      content: [{ type: "text", text: line }]
    }))
  };
}