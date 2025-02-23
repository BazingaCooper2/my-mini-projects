import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from './firebase-config.js';

import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from './firebase-config.js';

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileEmail = document.getElementById('profile-email');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log('Signed in successfully', user);
                updateProfileUI(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Login failed', errorCode, errorMessage);
            });
    });

    signupBtn.addEventListener('click', () => {
        window.location.href = 'https://accounts.google.com/signup/v2/web_create_account?continue=https://console.firebase.google.com/project/your-project-id/authentication/providers';
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                // Signed out
                console.log('Signed out successfully');
                updateProfileUI(null);
            })
            .catch((error) => {
                console.error('Logout failed', error);
            });
    });

    function updateProfileUI(user) {
        if (user) {
            profileEmail.textContent = `Logged in as ${user.email}`;
            profileEmail.style.display = 'block';
            loginForm.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            profileEmail.textContent = '';
            profileEmail.style.display = 'none';
            loginForm.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    onAuthStateChanged(auth, (user) => {
        updateProfileUI(user);
    });
});



const tasksCollection = collection(db, 'tasks');

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.querySelector('.task-form');
    const taskInput = document.querySelector('.task-input');
    const taskList = document.querySelector('.task-list');

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskName = taskInput.value;

        if (taskName.trim()) {
            addDoc(tasksCollection, {
                name: taskName,
                completed: false
            }).then(() => {
                taskInput.value = '';
            }).catch((error) => {
                console.error('Error adding task:', error);
            });
        }
    });

    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        taskList.innerHTML = '';
        tasks.forEach((task) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="task-${task.id}" class="task-label">${task.name}</label>
                <button class="task-delete" data-id="${task.id}">Delete</button>
            `;
            taskList.appendChild(taskItem);

            taskItem.querySelector('.task-delete').addEventListener('click', () => {
                const taskId = taskItem.querySelector('.task-delete').getAttribute('data-id');
                const taskDoc = db.collection('tasks').doc(taskId);
                taskDoc.delete().catch((error) => {
                    console.error('Error deleting task:', error);
                });
            });
        });
    });

    // Remember to unsubscribe when the component is destroyed
    // unsubscribe();
});

const notesCollection = collection(db, 'notes');

document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.querySelector('.note-form');
    const noteInput = document.querySelector('.note-input');
    const noteList = document.querySelector('.note-list');

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const noteContent = noteInput.value;

        if (noteContent.trim()) {
            addDoc(notesCollection, {
                content: noteContent,
                timestamp: new Date()
            }).then(() => {
                noteInput.value = '';
            }).catch((error) => {
                console.error('Error adding note:', error);
            });
        }
    });

    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        noteList.innerHTML = '';
        notes.forEach((note) => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <p class="note-content">${note.content}</p>
                <button class="note-delete" data-id="${note.id}">Delete</button>
            `;
            noteList.appendChild(noteItem);

            noteItem.querySelector('.note-delete').addEventListener('click', () => {
                const noteId = noteItem.querySelector('.note-delete').getAttribute('data-id');
                const noteDoc = db.collection('notes').doc(noteId);
                noteDoc.delete().catch((error) => {
                    console.error('Error deleting note:', error);
                });
            });
        });
    });

    // Remember to unsubscribe when the component is destroyed
    // unsubscribe();
});