# DriverHub Pro Enterprise 🚀

**DriverHub Pro** is a modern, web-based Windows PnP Driver Manager, PowerShell Automated Script Generator, and AI Diagnostic Assistant.

Designed for IT technicians, system administrators, and PC enthusiasts, DriverHub Pro simplifies laptop & desktop driver management, hardware profiling, and automated deployment scripts using standard Windows tools like `PnPUtil`, `DISM`, and PowerShell.

---

## ✨ Features

- **💻 Hardware Profiler & PnP Scanner**:
  - View detailed PCI Vendor (VEN), Device (DEV), and Subsystem (SUBSYS) Hardware Instance IDs.
  - Direct 1-click lookup links on the **Microsoft Update Catalog**.
  - System specs detection (CPU, GPU, Chipset, BIOS version, RAM, NVMe VMD storage mode).

- **⚡ Automated PowerShell Script Generator (1-Click Optimizer)**:
  - Generates custom, standalone PowerShell scripts (`.ps1`) to batch install, back up, and optimize Windows drivers.
  - Includes restore point creation (`Checkpoint-Computer`), WHQL driver staging via `pnputil.exe /add-driver`, and device rescan.
  - Generates full executable commands (e.g. `.\Optimize_Windows_Drivers.ps1`).

- **🤖 Server-Side Gemini AI Diagnostic Assistant**:
  - Trouleshoot Windows Device Manager error codes (**Code 10**, **Code 28**, **Code 43**).
  - Solve **Intel VMD / RST NVMe drive detection** issues during Windows 10/11 setup.
  - Recommends exact driver installation orders for Acer, ASUS, Lenovo, Dell, HP, MSI, and custom builds.

- **📦 Driver Backup & Restore**:
  - Export system drivers into a structured folder (`C:\DriverBackup`) using DISM (`dism /online /export-driver`).
  - Generate 1-click restore scripts for offline Windows reinstalls.

- **🖥️ Real-Time Execution Console**:
  - Live simulation terminal with timestamped DISM and PnPUtil outputs.
  - Export execution logs to local `.log` files.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/driverhub-pro.git
   cd driverhub-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your optional Gemini API key for AI Diagnostics:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐙 How to Export & Push to GitHub

### Option A: Using AI Studio Direct Export (Easiest)
1. Open the **Settings** / **Export** menu in AI Studio (top right header).
2. Select **Export to GitHub** or download as a **ZIP file**.
3. If downloading ZIP:
   - Extract the ZIP archive on your computer.
   - Open PowerShell / Terminal in the extracted folder and run:
     ```bash
     git init
     git add .
     git commit -m "Initial commit: DriverHub Pro"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/driverhub-pro.git
     git push -u origin main
     ```

### Option B: Push via Git CLI
If you already have Git configured in your local environment:
```bash
git init
git add .
git commit -m "feat: DriverHub Pro Enterprise Suite"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/driverhub-pro.git
git push -u origin main
```

---

## 🚀 GitHub Actions Deployment & Workflow Permissions

### 1. 🔑 Fixing "Insufficient permissions to push workflow files" Error

If you see an error like `Insufficient permissions to push workflow files` when syncing with GitHub from AI Studio:

1. **Re-authorize GitHub App Permissions**:
   - Go to your **GitHub Settings** > **Applications** > **Authorized GitHub Apps** (or **Installed GitHub Apps**).
   - Find **Google AI Studio** / **AI Studio App**.
   - Grant **Workflows (Read and Write)** permissions.
2. **Alternative (Direct GitHub Web Upload)**:
   - If syncing fails, you can create or edit `.github/workflows/deploy.yml` directly inside your repository on GitHub.com using the web code editor.
   - Or push the file locally using standard Git CLI (`git push`).

---

## 🌐 Deploying to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow at `.github/workflows/deploy.yml`.

### Setup Steps:
1. Push your repository to GitHub (`main` or `master` branch).
2. Open your repository on GitHub and navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and publish your live app to GitHub Pages (`https://<username>.github.io/<repo-name>/`).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
