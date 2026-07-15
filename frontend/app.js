const statusCard = document.getElementById('status');
const resultsSection = document.getElementById('results');
const campaignConceptEl = document.getElementById('campaignConcept');
const variantsEl = document.getElementById('variants');
const checklistEl = document.getElementById('checklist');
const imagePromptsEl = document.getElementById('imagePrompts');
const imagesEl = document.getElementById('images');
const generateBtn = document.getElementById('generateBtn');

const inputs = {
  campaignBrief: document.getElementById('campaignBrief'),
  targetAudience: document.getElementById('targetAudience'),
  productDetails: document.getElementById('productDetails'),
  tone: document.getElementById('tone'),
  channels: document.getElementById('channels'),
};

function setStatus(message, type = 'info') {
  statusCard.className = `status-card ${type === 'error' ? 'error' : ''}`;
  statusCard.textContent = message;
  statusCard.classList.remove('hidden');
}

function clearStatus() {
  statusCard.classList.add('hidden');
  statusCard.textContent = '';
}

function showResults() {
  resultsSection.classList.remove('hidden');
}

function hideResults() {
  resultsSection.classList.add('hidden');
}

function clearResults() {
  campaignConceptEl.textContent = '';
  variantsEl.innerHTML = '';
  checklistEl.innerHTML = '';
  imagePromptsEl.innerHTML = '';
  imagesEl.innerHTML = '';
}

function formIsValid() {
  return Object.values(inputs).every((input) => input.value.trim().length > 0);
}

generateBtn.addEventListener('click', async () => {
  if (!formIsValid()) {
    setStatus('Please complete all fields before generating the campaign.', 'error');
    return;
  }

  clearStatus();
  hideResults();
  clearResults();
  generateBtn.disabled = true;
  setStatus('Generating campaign concept…');

  const payload = {
    campaign_brief: inputs.campaignBrief.value.trim(),
    target_audience: inputs.targetAudience.value.trim(),
    product_details: inputs.productDetails.value.trim(),
    tone: inputs.tone.value.trim(),
    channels: inputs.channels.value.trim(),
  };

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate campaign.');
    }

    const data = await response.json();
    setStatus('Campaign generated successfully. Review the results below.');
    renderResults(data);
    showResults();
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    generateBtn.disabled = false;
  }
});

function renderResults(data) {
  campaignConceptEl.textContent = data.campaignConcept || 'No concept generated.';

  if (Array.isArray(data.variants)) {
    data.variants.forEach((variant, index) => {
      const variantCard = document.createElement('div');
      variantCard.innerHTML = `
        <strong>Variant ${index + 1}</strong>
        <p><strong>Headline:</strong> ${variant.headline}</p>
        <p>${variant.body}</p>
      `;
      variantsEl.appendChild(variantCard);
    });
  }

  if (Array.isArray(data.checklist)) {
    data.checklist.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      checklistEl.appendChild(li);
    });
  }

  if (Array.isArray(data.imagePrompts)) {
    data.imagePrompts.forEach((prompt) => {
      const promptCard = document.createElement('div');
      promptCard.textContent = prompt;
      imagePromptsEl.appendChild(promptCard);
    });
  }

  if (Array.isArray(data.images)) {
    data.images.forEach((image) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `
        <img src="${image.url}" alt="Campaign image" loading="lazy" />
        <div class="image-caption">${image.prompt}</div>
      `;
      imagesEl.appendChild(card);
    });
  }
}
