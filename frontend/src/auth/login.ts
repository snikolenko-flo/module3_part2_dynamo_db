import { validateUserInput, logIn } from './handler.js';

const loginForm = document.getElementById('loginForm') as HTMLFormElement;

loginForm.onchange = validateUserInput(loginForm);
loginForm.onsubmit = logIn;
