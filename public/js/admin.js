const API_URL = '/api';
let currentUser = null;

async function checkAdminAccess() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }
    
    try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) { window.location.href = '/'; }
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('adminName').textContent = currentUser.user_metadata?.name || 'Admin';
        loadDashboard();
    } catch (error) {
        console.error('Admin access check failed:', error);
        window.location.href = '/';
    }
}

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
            document.getElementById('totalRevenue').textContent = `PKR ${(data.stats.totalRevenue || 0).toLocaleString()}`;
            document.getElementById('pendingKYC').textContent = data.stats.pendingKYC || 0;
            loadPendingProperties();
            loadAllProperties();
            loadUsers();
            loadAgents();
            loadAgencies();
            loadBuilders();
            loadBookings();
            loadKYC();
            loadCommissions();
        }
    } catch (error) { console.error('Dashboard load error:', error); }
}

async function loadPendingProperties() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('pendingPropertiesList');
    try {
        const response = await fetch(`${API_URL}/admin/properties/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(p => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${p.title}</h3>
                        <p class="text-sm text-gray-400">${p.city}, ${p.area}</p>
                        <p class="text-sm text-orange-500">PKR ${p.price?.toLocaleString() || 0}</p>
                        <p class="text-xs text-gray-500">By: ${p.users?.name || 'Unknown'}</p>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="approveProperty('${p.id}')" class="btn-premium">Approve</button>
                        <button onclick="rejectProperty('${p.id}')" class="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 transition">Reject</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-400">No pending properties</p>';
        }
    } catch (error) { console.error('Load pending error:', error); }
}

async function loadAllProperties() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('allPropertiesList');
    try {
        const response = await fetch(`${API_URL}/properties?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(p => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${p.title}</h3>
                        <p class="text-sm text-gray-400">${p.city}, ${p.area}</p>
                        <span class="status-badge ${p.status}">${p.status}</span>
                    </div>
                    <button onclick="deleteProperty('${p.id}')" class="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 transition">Delete</button>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-400">No properties found</p>';
        }
    } catch (error) { console.error('Load all properties error:', error); }
}

async function loadUsers() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('usersList');
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(u => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${u.name}</h3>
                        <p class="text-sm text-gray-400">${u.email}</p>
                        <span class="status-badge ${u.role}">${u.role}</span>
                        <span class="status-badge ${u.is_verified ? 'approved' : 'pending'}">${u.is_verified ? 'Verified' : 'Unverified'}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) { console.error('Load users error:', error); }
}

async function loadAgents() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('agentsList');
    try {
        const response = await fetch(`${API_URL}/agents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(a => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${a.users?.name || 'Unknown'}</h3>
                        <p class="text-sm text-gray-400">${a.users?.email || 'No email'}</p>
                        <p class="text-sm text-gray-400">Agency: ${a.agencies?.name || 'Individual'}</p>
                        <span class="status-badge ${a.status}">${a.status}</span>
                    </div>
                    <button onclick="verifyAgent('${a.id}')" class="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition">Verify</button>
                </div>
            `).join('');
        }
    } catch (error) { console.error('Load agents error:', error); }
}

async function loadAgencies() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('agenciesList');
    try {
        const response = await fetch(`${API_URL}/agencies`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(a => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${a.name}</h3>
                        <p class="text-sm text-gray-400">${a.email}</p>
                        <p class="text-sm text-gray-400">${a.phone || 'No phone'}</p>
                        <span class="status-badge ${a.status}">${a.status}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) { console.error('Load agencies error:', error); }
}

async function loadBuilders() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('buildersList');
    try {
        const response = await fetch(`${API_URL}/builders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(b => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${b.name}</h3>
                        <p class="text-sm text-gray-400">${b.email}</p>
                        <p class="text-sm text-gray-400">${b.phone || 'No phone'}</p>
                        <span class="status-badge ${b.status}">${b.status}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) { console.error('Load builders error:', error); }
}

async function loadBookings() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('bookingsList');
    try {
        const response = await fetch(`${API_URL}/admin/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(b => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">Booking #${b.id}</h3>
                        <p class="text-sm text-gray-400">Property: ${b.properties?.title || 'N/A'}</p>
                        <p class="text-sm text-orange-500">PKR ${b.amount?.toLocaleString() || 0}</p>
                        <span class="status-badge ${b.status}">${b.status}</span>
                        <span class="status-badge ${b.payment_status}">${b.payment_status}</span>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="updateBookingStatus('${b.id}','confirmed')" class="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition">Confirm</button>
                        <button onclick="updateBookingStatus('${b.id}','completed')" class="bg-blue-500/20 text-blue-500 px-4 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition">Complete</button>
                        <button onclick="updateBookingStatus('${b.id}','cancelled')" class="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 transition">Cancel</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) { console.error('Load bookings error:', error); }
}

async function loadKYC() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('kycList');
    try {
        const response = await fetch(`${API_URL}/admin/kyc`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(k => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">${k.users?.name || 'Unknown'}</h3>
                        <p class="text-sm text-gray-400">${k.users?.email || 'No email'}</p>
                        <p class="text-sm text-gray-400">Document: ${k.document_type}</p>
                        <span class="status-badge ${k.status}">${k.status}</span>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="verifyKYC('${k.user_id}','verified')" class="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition">Verify</button>
                        <button onclick="verifyKYC('${k.user_id}','rejected')" class="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 transition">Reject</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-400">No pending KYC</p>';
        }
    } catch (error) { console.error('Load KYC error:', error); }
}

async function loadCommissions() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('commissionsList');
    try {
        const response = await fetch(`${API_URL}/admin/commissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(c => `
                <div class="glass p-4 rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h3 class="font-semibold">Commission #${c.id}</h3>
                        <p class="text-sm text-gray-400">Booking: ${c.bookings?.id || 'N/A'}</p>
                        <p class="text-sm text-orange-500">PKR ${c.amount?.toLocaleString() || 0} (${c.rate}%)</p>
                        <span class="status-badge ${c.status}">${c.status}</span>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="payCommission('${c.id}')" class="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition">Pay</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-400">No commissions</p>';
        }
    } catch (error) { console.error('Load commissions error:', error); }
}

async function approveProperty(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/properties/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', 'Approved!', 'Property approved successfully');
            loadPendingProperties();
            loadAllProperties();
        }
    } catch (error) { console.error('Approve error:', error); }
}

async function rejectProperty(id) {
    const token = localStorage.getItem('token');
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    try {
        const response = await fetch(`${API_URL}/admin/properties/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id, reason })
        });
        const data = await response.json();
        if (data.success) {
            showToast('info', 'Rejected', 'Property rejected');
            loadPendingProperties();
            loadAllProperties();
        }
    } catch (error) { console.error('Reject error:', error); }
}

async function deleteProperty(id) {
    if (!confirm('Delete this property?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', 'Deleted', 'Property deleted');
            loadAllProperties();
        }
    } catch (error) { console.error('Delete error:', error); }
}

async function verifyAgent(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/agents/${id}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', 'Verified', 'Agent verified successfully');
            loadAgents();
        }
    } catch (error) { console.error('Verify agent error:', error); }
}

async function verifyKYC(userId, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/kyc/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ user_id: userId, status })
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', 'KYC Updated', `KYC ${status} successfully`);
            loadKYC();
        }
    } catch (error) { console.error('KYC error:', error); }
}

async function updateBookingStatus(id, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', 'Updated', `Booking ${status}`);
            loadBookings();
        }
    } catch (error) { console.error('Booking update error:', error); }
}

async function payCommission(id) {
    const token = localStorage.getItem('token');
    const transactionId = prompt('Transaction ID:');
    if (transactionId === null) return;
    try {
        const response = await fetch(`${API_URL}/admin/commissions/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id, transaction_id: transactionId })
        });
        const data = await response.json();
        if (data.success) {
            showToast('success', 'Paid!', 'Commission paid successfully');
            loadCommissions();
        }
    } catch (error) { console.error('Commission pay error:', error); }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function showToast(type, title, message) {
    alert(`${title}: ${message}`);
}

checkAdminAccess();
