// Admin Panel JavaScript
const API_URL = '/api';
let currentUser = null;

// Check admin access
async function checkAdminAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) {
            window.location.href = '/';
        }
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        loadDashboard();
    } catch (error) {
        console.error('Admin access check failed:', error);
        window.location.href = '/';
    }
}

// Load dashboard
async function loadDashboard() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalProperties').textContent = data.stats.totalProperties || 0;
            document.getElementById('pendingProperties').textContent = data.stats.pendingProperties || 0;
            document.getElementById('totalUsers').textContent = data.stats.totalUsers || 0;
            document.getElementById('totalRevenue').textContent = `PKR ${data.stats.revenue || 0}`;
            
            loadPendingProperties();
            loadAllProperties();
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Load pending properties
async function loadPendingProperties() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('pendingPropertiesList');
    
    try {
        const response = await fetch(`${API_URL}/admin/properties/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            container.innerHTML = data.data.map(property => `
                <div class="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 class="font-semibold">${property.title}</h3>
                        <p class="text-sm text-gray-400">${property.city}, ${property.area}</p>
                        <p class="text-sm text-orange-500">PKR ${property.price.toLocaleString()}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveProperty('${property.id}')" class="btn-premium btn-premium-sm">
                            Approve
                        </button>
                        <button onclick="rejectProperty('${property.id}')" class="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-sm hover:bg-red-500/30 transition">
                            Reject
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-400">No pending properties</p>';
        }
    } catch (error) {
        console.error('Load pending error:', error);
    }
}

// Load all properties
async function loadAllProperties() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('allPropertiesList');
    
    try {
        const response = await fetch(`${API_URL}/properties?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            container.innerHTML = data.data.map(property => `
                <div class="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 class="font-semibold">${property.title}</h3>
                        <p class="text-sm text-gray-400">${property.city}, ${property.area}</p>
                        <span class="status-badge ${property.status}">${property.status}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="deleteProperty('${property.id}')" class="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-sm hover:bg-red-500/30 transition">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load all properties error:', error);
    }
}

// Approve property
async function approveProperty(id) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/property/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id, action: 'approve' })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Property approved!');
            loadPendingProperties();
            loadAllProperties();
        }
    } catch (error) {
        console.error('Approve error:', error);
    }
}

// Reject property
async function rejectProperty(id) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/property/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id, action: 'reject' })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Property rejected!');
            loadPendingProperties();
            loadAllProperties();
        }
    } catch (error) {
        console.error('Reject error:', error);
    }
}

// Delete property
async function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Property deleted!');
            loadAllProperties();
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tab}Tab`).classList.remove('hidden');
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
}

// Initialize
checkAdminAccess();
