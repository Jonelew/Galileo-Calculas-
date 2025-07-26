// Lecture Schedule Manager
class LectureScheduler {
    constructor() {
        this.lectures = this.loadLectures();
        this.currentView = 'upcoming';
        this.editingLecture = null;
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.renderLectures();
        this.updateSubjectFilter();
        this.setDefaultDate();
    }

    bindEvents() {
        // Form submission
        document.getElementById('lectureForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // View toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Search functionality
        document.getElementById('searchLectures').addEventListener('input', (e) => {
            this.filterLectures();
        });

        // Subject filter
        document.getElementById('filterSubject').addEventListener('change', (e) => {
            this.filterLectures();
        });

        // Modal events
        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeModal();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    handleFormSubmit() {
        const formData = new FormData(document.getElementById('lectureForm'));
        const lecture = {
            id: this.editingLecture ? this.editingLecture.id : Date.now(),
            subject: formData.get('subject'),
            date: formData.get('date'),
            time: formData.get('time'),
            duration: parseInt(formData.get('duration')),
            platform: formData.get('platform'),
            instructor: formData.get('instructor'),
            meetingLink: formData.get('meetingLink'),
            notes: formData.get('notes'),
            createdAt: this.editingLecture ? this.editingLecture.createdAt : Date.now()
        };

        if (this.editingLecture) {
            this.updateLecture(lecture);
        } else {
            this.addLecture(lecture);
        }

        this.resetForm();
        this.saveLectures();
        this.renderLectures();
        this.updateSubjectFilter();
        this.showNotification(this.editingLecture ? 'Lecture updated successfully!' : 'Lecture added successfully!');
    }

    addLecture(lecture) {
        this.lectures.push(lecture);
    }

    updateLecture(lecture) {
        const index = this.lectures.findIndex(l => l.id === lecture.id);
        if (index !== -1) {
            this.lectures[index] = lecture;
        }
        this.editingLecture = null;
    }

    deleteLecture(id) {
        this.lectures = this.lectures.filter(lecture => lecture.id !== id);
        this.saveLectures();
        this.renderLectures();
        this.updateSubjectFilter();
        this.showNotification('Lecture deleted successfully!');
    }

    editLecture(id) {
        const lecture = this.lectures.find(l => l.id === id);
        if (lecture) {
            this.editingLecture = lecture;
            this.populateForm(lecture);
            // Scroll to form
            document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
        }
    }

    populateForm(lecture) {
        document.getElementById('subject').value = lecture.subject;
        document.getElementById('date').value = lecture.date;
        document.getElementById('time').value = lecture.time;
        document.getElementById('duration').value = lecture.duration;
        document.getElementById('platform').value = lecture.platform;
        document.getElementById('instructor').value = lecture.instructor || '';
        document.getElementById('meetingLink').value = lecture.meetingLink || '';
        document.getElementById('notes').value = lecture.notes || '';
        
        // Update submit button text
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Lecture';
    }

    resetForm() {
        document.getElementById('lectureForm').reset();
        this.editingLecture = null;
        this.setDefaultDate();
        
        // Reset submit button text
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Lecture';
    }

    switchView(view) {
        this.currentView = view;
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.renderLectures();
    }

    filterLectures() {
        const searchTerm = document.getElementById('searchLectures').value.toLowerCase();
        const selectedSubject = document.getElementById('filterSubject').value;
        
        let filteredLectures = this.lectures;
        
        // Filter by view (upcoming/all)
        if (this.currentView === 'upcoming') {
            const now = new Date();
            filteredLectures = filteredLectures.filter(lecture => {
                const lectureDateTime = new Date(`${lecture.date}T${lecture.time}`);
                return lectureDateTime >= now;
            });
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredLectures = filteredLectures.filter(lecture => 
                lecture.subject.toLowerCase().includes(searchTerm) ||
                (lecture.instructor && lecture.instructor.toLowerCase().includes(searchTerm)) ||
                (lecture.notes && lecture.notes.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filter by subject
        if (selectedSubject) {
            filteredLectures = filteredLectures.filter(lecture => 
                lecture.subject === selectedSubject
            );
        }
        
        this.renderLectureList(filteredLectures);
    }

    renderLectures() {
        this.filterLectures();
    }

    renderLectureList(lectures) {
        const lectureList = document.getElementById('lectureList');
        
        if (lectures.length === 0) {
            lectureList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No lectures found</h3>
                    <p>${this.currentView === 'upcoming' ? 'No upcoming lectures scheduled' : 'No lectures match your search criteria'}</p>
                </div>
            `;
            return;
        }
        
        // Sort lectures by date and time
        lectures.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        lectureList.innerHTML = lectures.map(lecture => this.createLectureCard(lecture)).join('');
    }

    createLectureCard(lecture) {
        const lectureDateTime = new Date(`${lecture.date}T${lecture.time}`);
        const now = new Date();
        const isUpcoming = lectureDateTime >= now;
        const isPast = lectureDateTime < now;
        
        const endTime = new Date(lectureDateTime.getTime() + lecture.duration * 60000);
        const formattedDate = lectureDateTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = lectureDateTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const formattedEndTime = endTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const statusClass = isUpcoming ? 'upcoming' : (isPast ? 'past' : '');
        
        return `
            <div class="lecture-item ${statusClass}">
                <div class="lecture-header">
                    <div>
                        <div class="lecture-subject">${lecture.subject}</div>
                        ${lecture.instructor ? `<div class="lecture-instructor"><i class="fas fa-user-tie"></i> ${lecture.instructor}</div>` : ''}
                    </div>
                    <div class="lecture-actions">
                        <button class="action-btn edit-btn" onclick="scheduler.editLecture(${lecture.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="scheduler.showDeleteModal(${lecture.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="lecture-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${formattedTime} - ${formattedEndTime}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-hourglass-half"></i>
                        <span>${lecture.duration} minutes</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-video"></i>
                        <span>${lecture.platform}</span>
                    </div>
                </div>
                
                ${lecture.meetingLink ? `
                    <div style="margin: 15px 0;">
                        <a href="${lecture.meetingLink}" target="_blank" class="meeting-link">
                            <i class="fas fa-external-link-alt"></i> Join Meeting
                        </a>
                    </div>
                ` : ''}
                
                ${lecture.notes ? `
                    <div class="lecture-notes">
                        <strong>Notes:</strong> ${lecture.notes}
                    </div>
                ` : ''}
            </div>
        `;
    }

    showDeleteModal(id) {
        this.lectureToDelete = id;
        document.getElementById('deleteModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('deleteModal').classList.remove('show');
        this.lectureToDelete = null;
    }

    confirmDelete() {
        if (this.lectureToDelete) {
            this.deleteLecture(this.lectureToDelete);
            this.closeModal();
        }
    }

    updateSubjectFilter() {
        const subjects = [...new Set(this.lectures.map(lecture => lecture.subject))].sort();
        const filterSelect = document.getElementById('filterSubject');
        
        filterSelect.innerHTML = '<option value="">All Subjects</option>';
        subjects.forEach(subject => {
            filterSelect.innerHTML += `<option value="${subject}">${subject}</option>`;
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add animation styles if not already present
        if (!document.getElementById('notificationStyles')) {
            const styles = document.createElement('style');
            styles.id = 'notificationStyles';
            styles.innerHTML = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadLectures() {
        try {
            const stored = localStorage.getItem('lectures');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading lectures from localStorage:', error);
            return [];
        }
    }

    saveLectures() {
        try {
            localStorage.setItem('lectures', JSON.stringify(this.lectures));
        } catch (error) {
            console.error('Error saving lectures to localStorage:', error);
            this.showNotification('Error saving data. Please try again.');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scheduler = new LectureScheduler();
});

// Add some sample data for demonstration (only if no lectures exist)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.scheduler && window.scheduler.lectures.length === 0) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const sampleLectures = [
                {
                    id: 1,
                    subject: 'Advanced JavaScript',
                    date: tomorrow.toISOString().split('T')[0],
                    time: '10:00',
                    duration: 90,
                    platform: 'Zoom',
                    instructor: 'Dr. Sarah Johnson',
                    meetingLink: 'https://zoom.us/j/1234567890',
                    notes: 'Covering ES6+ features, async/await, and modern JavaScript patterns',
                    createdAt: Date.now()
                },
                {
                    id: 2,
                    subject: 'React Development',
                    date: tomorrow.toISOString().split('T')[0],
                    time: '14:30',
                    duration: 120,
                    platform: 'Google Meet',
                    instructor: 'Prof. Mike Chen',
                    meetingLink: 'https://meet.google.com/abc-defg-hij',
                    notes: 'Building modern React applications with hooks and context',
                    createdAt: Date.now()
                }
            ];
            
            // Only add sample data if user wants it
            if (confirm('Would you like to add some sample lectures to get started?')) {
                window.scheduler.lectures = sampleLectures;
                window.scheduler.saveLectures();
                window.scheduler.renderLectures();
                window.scheduler.updateSubjectFilter();
            }
        }
    }, 1000);
});