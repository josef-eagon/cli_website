// import './style.css'



class Terminal {
  constructor() {
    this.output = document.getElementById('output');
    this.commandInput = document.getElementById('command-input');
    this.inputLine = document.getElementById('input-line');
    this.mobileInput = document.getElementById('mobile-input');
    this.currentInput = '';

    this.quotes = [
      'Maybe you can swim better with a belly full of fish.',
      'Never trust a pig farmer with a handwritten sign.',
      'I think I am funny, but I am not as funny as I think I am.',
      'You mean to tell me anyone can just make a website?',
      'My grandfather used to tell me my hair is curly because my skull is so thick it had to drill its way out.',
      'At my core, I am just a silly little guy.',
      'Poetry is a way to make words sing for you.',
      'There is magic in the air today. Can you feel it?',
      'Shakespeare has been called annoyingly quotable.',
      'Some people don’t know which questions to ask, or they ask them in the wrong order.',
      'Earth is a 10/10 planet.',
      'Anyone can create art, but not everyone will understand the art they create.',
      'The lesson of Icarus is to make better wings.',
      'You are really only confined by the box you build around yourself.',
      'I just say stuff sometimes.',
      'Fables are not fairy tales.',
      'The gods gave us fire and we made rocks talk.',
      'I know a thing or two about being OK.',
      'If I can make you think, I have succeeded.',
      'Nothing cradles you quite like moonlight.',
      'Every once in a while, the improbable thing does actually happen.',
      'Coincidence and probability have an uneven friendship.',
      'There is a lot of scheming in the animal kingdom.',
      "Gift yourself a good cast iron pan.",
      "I just do stuff."
    ];

    // Commands map
    this.commands = {
      'help': this.runHelp.bind(this),
      'clear': this.clear.bind(this),
      'quote': this.runQuote.bind(this),
      'contact': this.runContact.bind(this),
      'goto': this.runGoto.bind(this),
      'about': this.runAbout.bind(this),
    };

    // Initial greeting
    this.type("Greetings visitor...");

    this.bindEvents();
  }

  bindEvents() {
    // Focus hidden input on terminal click (for mobile)
    document.getElementById('terminal').addEventListener('click', () => {
      this.mobileInput.focus();
    });

    // Handle hidden input events (Mobile/Focused mode)
    this.mobileInput.addEventListener('input', (e) => {
      this.currentInput = this.mobileInput.value;
      this.updateInputDisplay();
      window.scrollTo(0, document.body.scrollHeight);
    });

    this.mobileInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.currentInput.trim();
        this.print(`user@portfolio:~$ ${this.currentInput}`);
        this.currentInput = '';
        this.mobileInput.value = ''; // Clear hidden input
        this.updateInputDisplay();
        this.executeCommand(cmd);
      }
    });

    // Handle global keys (Desktop/Unfocused mode)
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in the hidden input to avoid double chars
      if (e.target === this.mobileInput) return;

      // Handle backspace
      if (e.key === 'Backspace') {
        this.currentInput = this.currentInput.slice(0, -1);
        this.mobileInput.value = this.currentInput; // Sync hidden input
        this.updateInputDisplay();
        return;
      }

      // Handle Enter
      if (e.key === 'Enter') {
        const cmd = this.currentInput.trim();
        this.print(`user@portfolio:~$ ${this.currentInput}`);
        this.currentInput = '';
        this.mobileInput.value = ''; // Sync hidden input
        this.updateInputDisplay();
        this.executeCommand(cmd);
        return;
      }

      // Handle regular characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        this.currentInput += e.key;
        this.mobileInput.value = this.currentInput; // Sync hidden input
        this.updateInputDisplay();
        // Keep window scrolled to bottom
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
  }

  updateInputDisplay() {
    this.commandInput.textContent = this.currentInput;
  }

  print(text) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.textContent = text;
    this.output.appendChild(line);
    window.scrollTo(0, document.body.scrollHeight);
  }

  async type(text, speed = 50) {
    const line = document.createElement('div');
    line.className = 'output-line';
    this.output.appendChild(line);

    for (let i = 0; i < text.length; i++) {
      line.textContent += text[i];
      await new Promise(r => setTimeout(r, speed));
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  async executeCommand(input) {
    if (!input) return;

    const args = input.trim().split(/\s+/);
    const command = args[0].toLowerCase();
    const commandArgs = args.slice(1);

    if (this.commands[command]) {
      await this.commands[command](commandArgs);
    } else {
      this.print(`Command not found: ${command}. Type 'help' for available commands.`);
    }
  }

  clear() {
    this.output.innerHTML = '';
  }

  async runQuote() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    const quote = this.quotes[randomIndex];
    this.print(`"${quote}"`);
  }

  async runContact() {
    this.print("Contact Information:");
    this.print("  Email: josef.eagon@proton.me");
    this.print("  X/Bluesky: @josefeagon");
    this.print("  GitHub: https://github.com/josef-eagon");
  }

  async runGoto(args) {
    if (args.length === 0) {
      this.print("Usage: goto <page>");
      return;
    }

    const page = args[0].toLowerCase();
    this.print(`Redirecting to ${page}...`);

    // Slight delay for effect
    await new Promise(r => setTimeout(r, 1000));

    // In a real app with routing we might check for valid pages first
    // For now, we assume simple HTML files for other pages
    const baseUrl = (import.meta.env && import.meta.env.BASE_URL) || '/cli_website/';
    // Ensure we don't double slash if BASE_URL ends with /
    const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    window.location.href = `${prefix}${page}.html`;
  }

  async runAbout() {
    await this.type("My name is Josef. I love making things. This site is where I put some of my favorites. If you are new to me, I recommend reading one of my fables. Try typing: goto fables.");
  }

  async runHelp() {
    await this.type("try and type 'goto tree'");

    this.print(" ");
    this.print("Available commands:");
    this.print("  help           - Show this message");
    this.print("  quote          - Show a random quote");
    this.print("  contact        - Show contact info");
    this.print("  about          - Learn more about me");
    this.print("  goto <page>    - Navigate to a specific page");
    this.print("  clear          - Clear terminal");
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  new Terminal();
});
