# Installation Instructions

## Quick Start Guide

Follow these steps to get the Recipe Costing Application running on your Windows computer.

## Step 1: Install MySQL Server

### Download MySQL

1. Visit [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Click on "MySQL Installer for Windows"
3. Download the installer (choose "Windows (x86, 32-bit), MSI Installer" or 64-bit version)

### Install MySQL

1. Run the downloaded installer
2. Choose "Custom" installation type
3. Select these components:
   - MySQL Server (latest version)
   - MySQL Workbench (optional, for database management)
4. Click "Next" and then "Execute" to install

### Configure MySQL

1. **Configuration Type**: Choose "Development Computer"
2. **Port**: Leave as default (3306)
3. **Authentication Method**: Use Strong Password Encryption
4. **Root Password**: Set a password and **remember it** (you'll need this later)
5. **Windows Service**: Check "Start MySQL Server at System Startup"
6. Click "Execute" to apply configuration

### Verify MySQL Installation

1. Open Command Prompt (Windows + R, type `cmd`, press Enter)
2. Type: `mysql --version`
3. You should see the MySQL version number

## Step 2: Install Node.js

### Install Node.js

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (20.x or later)
3. Run the installer
4. Follow the installation wizard (use default settings)
5. Verify installation: Open Command Prompt and type `node --version`

## Step 3: Extract and Setup the Application

### Extract the Application

1. Extract the `recipe-costing-app-fixed.zip` file to a location of your choice
2. Example: `C:\Users\YourName\recipe-costing-app`

### Install Dependencies

1. Open Command Prompt
2. Navigate to the application folder:
   ```bash
   cd C:\Users\YourName\recipe-costing-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   This may take a few minutes.

## Step 4: Configure Database Connection

### Set MySQL Password

**Option 1: Environment Variable (Recommended)**

1. Press Windows + R, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → "Environment Variables"
3. Under "User variables", click "New"
4. Variable name: `DB_PASSWORD`
5. Variable value: Your MySQL root password
6. Click OK to save
7. **Important**: Close and reopen Command Prompt for changes to take effect

**Option 2: Create .env File**

1. In the application folder, create a file named `.env`
2. Add this content (replace with your password):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=recipe_costing_db
   ```

## Step 5: Run the Application

### Development Mode (Testing)

**Option A: Web Browser**

1. Open two Command Prompt windows
2. In the first window:
   ```bash
   cd C:\Users\YourName\recipe-costing-app
   npm run dev:server
   ```
3. In the second window:
   ```bash
   cd C:\Users\YourName\recipe-costing-app
   npm run dev:next
   ```
4. Open your browser and go to [http://localhost:3000](http://localhost:3000)

**Option B: Desktop Application**

1. Open Command Prompt
2. Navigate to the application folder
3. Run:
   ```bash
   npm run electron:dev
   ```
4. The application window will open automatically

### First Launch

On first launch, the application will:
- Automatically create the database `recipe_costing_db`
- Create all necessary tables
- Redirect you to the Product Entry page

## Troubleshooting

### "Access denied for user 'root'@'localhost'"

**Problem**: Wrong MySQL password

**Solution**:
- Verify your MySQL password is correct
- Update the `DB_PASSWORD` environment variable or `.env` file
- Restart the application

### "Can't connect to MySQL server"

**Problem**: MySQL service not running

**Solution**:
1. Press Windows + R, type `services.msc`, press Enter
2. Find "MySQL" or "MySQL80" in the list
3. Right-click and select "Start"
4. Restart the application

### Dependencies Installation Fails

**Problem**: Network issues or permission problems

**Solution**:
1. Run Command Prompt as Administrator
2. Clear npm cache: `npm cache clean --force`
3. Try installing again: `npm install`

### "npm ERR! peer dependency" warnings

**Problem**: Peer dependency warnings (these are usually safe to ignore)

**Solution**:
- These warnings don't prevent the app from running
- If installation fails, try: `npm install --legacy-peer-deps`

### Port 3000 or 3001 Already in Use

**Problem**: Another application is using these ports

**Solution**:
1. Close other applications that might use these ports
2. Or modify the ports in:
   - `package.json` (change dev:next port)
   - `server/index.js` (change PORT constant)

### "Cannot find module" errors

**Problem**: Dependencies not installed correctly

**Solution**:
1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again

## Next Steps

Once the application is running:

1. Read the **USER_GUIDE.md** for detailed usage instructions
2. Start by adding products in the "Product Entry" page
3. Manage products in the "Product Management" page
4. Create recipes in the "Recipe Creation" page

## Building for Production (Optional)

To create a standalone Windows executable:

```bash
# Build the application
npm run build

# Create Windows installer
npm run package
```

The installer will be created in the `dist` folder.

## Support

For detailed database setup, see **DATABASE_SETUP.md**

For application usage, see **USER_GUIDE.md**

---

**Developed by Manus AI**
