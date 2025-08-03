import api, { route } from '@forge/api';
import { kvs } from '@forge/kvs';

export async function issueCreatedHandler (event, context) {
  console.log('Issue created event:', event.issue.key, 'project:', event.issue.fields.project.key);

  const customFieldValue = await getCustomFieldValue();
  const openAPIKey = await getAPIKeyValue();
  console.log('La valeur du customfield est ' + customFieldValue);
  // console.log('La valeur de la clé API est ' + openAPIKey);

  const issueDescription = await getIssueDescription(event.issue.key);

  console.log("Description "+ issueDescription);

  const updatedDescription = await callOpenAI (issueDescription, openAPIKey);

  await updateTextAreaField(event.issue.key, customFieldValue, textToADF(updatedDescription));

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

const extractTextLinesADF = (node) => {
  if (Array.isArray(node)) {
    return node.flatMap(extractTextLinesADF);
  }
  if (node.type === 'text' && typeof node.text === 'string') {
    return [node.text];
  }
  if (node.content && Array.isArray(node.content)) {
    return extractTextLinesADF(node.content);
  }
  return [];
};

export async function getIssueDescription(issueKey) {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issueKey}?fields=description`);
  if (!response.ok) {
    throw new Error(`Lecture imposssible de la demande ${issueKey}, statut ${response.status}`);
  }
  const json = await response.json();
  const adf = json.fields?.description;

  if (!adf || !adf.content || adf.content.length === 0) {
    return ''; // Description vide ou non existante
  }

  // Extrait tous les segments de texte en ligne
  const lines = extractTextLinesADF(adf.content);

  // Reconstitue une chaîne avec retour à la ligne entre chaque fragment
  return lines.join('\n');
}

export async function callOpenAI (issueDescription, openAPIKey) {

  const choiceCount = 1;
  // OpenAI API endpoint
  const url = `https://api.openai.com/v1/chat/completions`;
  const content = `Réécris moi ce texte sous forme de blague de Toto : "${issueDescription}".`
  console.log("Contenu envoyé : "+content)
  // Body for API call
  const body = {
    model: getOpenAPIModel(),
    n: choiceCount,
    messages: [{
      role: 'user',
      content: content
    }]
  };

  // API call options
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAPIKey}`,
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify(body)
  };

  // API call to OpenAI
  const response = await fetch(url, options);
  let result = ''

  if (response.status === 200) {
    const chatCompletion = await response.json();
    const firstChoice = chatCompletion.choices[0]

    if (firstChoice) {
      result = firstChoice.message.content;
    } else {
      console.warn(`Chat completion response did not include any assistance choices.`);
      result = `AI response did not include any choices.`;
    }
  } else {
    const text = await response.text();
    result = text;
    console.log("Réponse de ChatGPT : "+result)
  }

  return result;
}

// Get OpenAI model
const getOpenAPIModel = () => {
  return 'gpt-3.5-turbo';
  // return 'gpt-4';
}