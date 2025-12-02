// API Base URL
const API_BASE = '';

// State
let contentTypes = [];
let currentContentType = null;

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Load content types on page load
async function loadContentTypes() {
    try {
        const response = await fetch(`${API_BASE}/api/content-types/`);
        const data = await response.json();
        contentTypes = data;
        
        displayContentTypes(data);
        populateContentTypeSelects(data);
    } catch (error) {
        console.error('Error loading content types:', error);
        document.getElementById('content-types-list').innerHTML = `
            <div class="alert alert-error">
                Failed to load content types. Make sure the backend is running.
            </div>
        `;
    }
}

// Display content types as cards
function displayContentTypes(types) {
    const container = document.getElementById('content-types-list');
    
    if (types.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No content types yet. Create one in the admin panel!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = types.map(type => `
        <div class="content-type-card">
            <h3>${type.display_name}</h3>
            <div class="type-name">${type.name}</div>
            <p>${type.description || 'No description'}</p>
            <div class="field-count">📊 ${type.field_count} field(s)</div>
        </div>
    `).join('');
}

// Populate content type select dropdowns
function populateContentTypeSelects(types) {
    const createSelect = document.getElementById('content-type-select');
    const viewSelect = document.getElementById('view-content-type-select');
    
    const options = types.map(type => 
        `<option value="${type.name}">${type.display_name}</option>`
    ).join('');
    
    createSelect.innerHTML = '<option value="">-- Choose Content Type --</option>' + options;
    viewSelect.innerHTML = '<option value="">-- Choose Content Type --</option>' + options;
}

// Load schema for selected content type and generate form
document.getElementById('content-type-select').addEventListener('change', async (e) => {
    const contentTypeName = e.target.value;
    
    if (!contentTypeName) {
        document.getElementById('dynamic-form-container').innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/content-types/${contentTypeName}/`);
        const contentType = await response.json();
        
        currentContentType = contentType;
        generateDynamicForm(contentType);
    } catch (error) {
        console.error('Error loading content type schema:', error);
        showAlert('Failed to load content type schema', 'error');
    }
});

// Generate dynamic form based on schema
function generateDynamicForm(contentType) {
    const container = document.getElementById('dynamic-form-container');
    
    const formHTML = `
        <h3>Create ${contentType.display_name}</h3>
        <form id="dynamic-form">
            ${contentType.fields.map(field => generateFormField(field)).join('')}
            <div class="form-group">
                <button type="submit" class="btn btn-success">Create ${contentType.display_name}</button>
            </div>
        </form>
    `;
    
    container.innerHTML = formHTML;
    
    // Handle form submission
    document.getElementById('dynamic-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit(contentType.name);
    });
}

// Generate individual form field based on field type
function generateFormField(field) {
    const required = field.is_required ? '<span class="required">*</span>' : '';
    const helpText = field.help_text ? `<div class="help-text">${field.help_text}</div>` : '';
    
    let inputHTML = '';
    
    switch (field.field_type) {
        case 'textarea':
            inputHTML = `
                <textarea 
                    id="${field.field_name}" 
                    name="${field.field_name}" 
                    class="form-control"
                    ${field.is_required ? 'required' : ''}
                >${field.default_value || ''}</textarea>
            `;
            break;
        
        case 'number':
            inputHTML = `
                <input 
                    type="number" 
                    id="${field.field_name}" 
                    name="${field.field_name}" 
                    class="form-control"
                    value="${field.default_value || ''}"
                    ${field.is_required ? 'required' : ''}
                />
            `;
            break;
        
        case 'email':
            inputHTML = `
                <input 
                    type="email" 
                    id="${field.field_name}" 
                    name="${field.field_name}" 
                    class="form-control"
                    value="${field.default_value || ''}"
                    ${field.is_required ? 'required' : ''}
                />
            `;
            break;
        
        case 'date':
            inputHTML = `
                <input 
                    type="date" 
                    id="${field.field_name}" 
                    name="${field.field_name}" 
                    class="form-control"
                    value="${field.default_value || ''}"
                    ${field.is_required ? 'required' : ''}
                />
            `;
            break;
        
        case 'boolean':
            inputHTML = `
                <input 
                    type="checkbox" 
                    id="${field.field_name}" 
                    name="${field.field_name}"
                    ${field.default_value === 'true' ? 'checked' : ''}
                />
            `;
            break;
        
        case 'select':
            const options = field.choices ? field.choices.map(choice => 
                `<option value="${choice}">${choice}</option>`
            ).join('') : '';
            
            inputHTML = `
                <select 
                    id="${field.field_name}" 
                    name="${field.field_name}" 
                    class="form-control"
                    ${field.is_required ? 'required' : ''}
                >
                    <option value="">-- Select ${field.display_name} --</option>
                    ${options}
                </select>
            `;
            break;
        
        default: // text
            inputHTML = `
                <input 
                    type="text" 
                    id="${field.field_name}" 
                    name="${field.field_name}" 
                    class="form-control"
                    value="${field.default_value || ''}"
                    ${field.is_required ? 'required' : ''}
                />
            `;
    }
    
    return `
        <div class="form-group">
            <label for="${field.field_name}">
                ${field.display_name}${required}
            </label>
            ${inputHTML}
            ${helpText}
        </div>
    `;
}

// Handle form submission
async function handleFormSubmit(contentTypeName) {
    const form = document.getElementById('dynamic-form');
    const formData = new FormData(form);
    
    const data = {};
    for (const [key, value] of formData.entries()) {
        // Handle checkboxes
        const input = form.querySelector(`[name="${key}"]`);
        if (input.type === 'checkbox') {
            data[key] = input.checked;
        } else {
            data[key] = value;
        }
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/content/${contentTypeName}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(`${currentContentType.display_name} created successfully!`, 'success');
            form.reset();
        } else {
            showAlert(`Error: ${JSON.stringify(result.error)}`, 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('Failed to submit form', 'error');
    }
}

// Load content when content type is selected in view tab
document.getElementById('view-content-type-select').addEventListener('change', async (e) => {
    const contentTypeName = e.target.value;
    
    if (!contentTypeName) {
        document.getElementById('content-list-container').innerHTML = '';
        return;
    }
    
    await loadContent(contentTypeName);
});

// Load and display content
async function loadContent(contentTypeName) {
    const container = document.getElementById('content-list-container');
    container.innerHTML = '<div class="loading">Loading content...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/content/${contentTypeName}/`);
        const data = await response.json();
        
        displayContent(data.results, contentTypeName);
    } catch (error) {
        console.error('Error loading content:', error);
        container.innerHTML = `
            <div class="alert alert-error">
                Failed to load content
            </div>
        `;
    }
}

// Display content items
function displayContent(items, contentTypeName) {
    const container = document.getElementById('content-list-container');
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No content yet. Create some!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="content-item">
            <div class="content-item-header">
                <div class="content-item-id">ID: ${item.id}</div>
                <div class="content-item-actions">
                    <button class="btn btn-danger" onclick="deleteContent('${contentTypeName}', '${item.id}')">
                        Delete
                    </button>
                </div>
            </div>
            <div class="content-item-data">
                ${Object.entries(item)
                    .filter(([key]) => !['id', 'content_type', 'created_at', 'updated_at'].includes(key))
                    .map(([key, value]) => `
                        <div class="data-field">
                            <div class="data-field-label">${key}</div>
                            <div class="data-field-value">${value}</div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `).join('');
}

// Delete content
async function deleteContent(contentTypeName, contentId) {
    if (!confirm('Are you sure you want to delete this content?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/content/${contentTypeName}/${contentId}/`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Content deleted successfully', 'success');
            await loadContent(contentTypeName);
        } else {
            showAlert('Failed to delete content', 'error');
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        showAlert('Failed to delete content', 'error');
    }
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.tab-content.active');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Initialize app
loadContentTypes();
