# SheCare Health Platform - Frontend

## Project Overview
SheCare is a comprehensive healthcare administration dashboard that provides AI-powered health tips, user management, prescription analytics, and system configuration for healthcare practitioners and patients.

## Features

### Dashboard
- **Real-time Statistics**: Total users, participants, practitioners, and active sessions
- **Data Visualization**: Bar charts and trend analysis for user roles
- **AI Tips Overview**: Recent AI-generated health tips with categories
- **Prescription Analytics**: Total prescriptions and most common medications
- **Global Search**: Unified search across users, tips, prescriptions, and statistics
- **Admin Profile**: Administrator information and login details

### Users Management
- **User Statistics**: Total participants, practitioners, and associates
- **Search & Filter**: Real-time user search by name, email, or role
- **User Table**: Complete user listing with roles, ages, and locations
- **Data Visualization**: 
  - User role distribution (Doughnut chart)
  - User growth timeline
- **Role-based Access**: Participant, Practitioner, and Admin roles

### Tips Analytics
- **AI-Generated Health Tips**: Automated health advice generation
- **Quality Control Workflow**: Practitioner verification system
- **Analytics Metrics**:
  - Total tips and active tips count
  - Monthly tips sent and verification rates
  - Pending verification and rejection rates
- **Advanced Charts**:
  - Tips by category distribution
  - Top tip verifiers with approval rates
  - Tip workflow status (pending/approved/rejected)
  - 30-day tips timeline
  - Tips status distribution

### Settings & Configuration
- **System Configuration**:
  - API base URL management
  - AI response delay settings
  - Automatic daily backups
  - Maintenance mode toggle
- **User Management**:
  - New user registration controls
  - Default user role settings
  - Session timeout configuration
  - Prescription limits per user
- **Appearance Settings**:
  - Dark/Light theme toggle
  - Theme persistence across sessions

###  UI/UX Features
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Theme**: User-selectable color schemes
- **Tab-based Navigation**: Organized section management
- **Real-time Filtering**: Instant search and date filtering
- **Interactive Charts**: Visual data representation
- **Status Badges**: Visual indicators for tip and user status

## Technical Stack

### Frontend Framework
- **React 18** - Component-based UI library
- **React Router DOM** - Client-side routing
- **React Context API** - State management for themes

### Data Visualization
- **Custom Chart Components** - Bar graphs, doughnut charts, timelines
- **CSS-based Charts** - Lightweight, no external dependencies

### Styling
- **CSS3** - Custom styles with CSS variables
- **Component-scoped Styles** - Modular CSS architecture
- **Theme System** - Dynamic dark/light mode switching

### API Integration
- **Axios** - HTTP client for API communication
- **RESTful APIs** - Backend service integration

## Project Structure
src/
├── components/
│ ├── charts/
│ │ ├── BarGraph.jsx
│ │ ├── DonutChart.jsx
│ │ └── UserGrowthTimeline.jsx
│ ├── forms/
│ │ └── Searchbar.jsx
│ ├── layout/
│ │ ├── Header.jsx
│ │ ├── Sidebar.jsx
│ │ └── ThemeContext.jsx
│ └── pages/
│ ├── Dashboard.jsx
│ ├── Users.jsx
│ ├── Tips.jsx
│ ├── Prescriptions.jsx
│ └── Settings.jsx
├── styles/
│ ├── Dashboard.css
│ ├── Users.css
│ ├── Tips.css
│ ├── Prescriptions.css
│ └── Settings.css
└── App.jsx


## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps
1. **Clone the repository**
 ```bash
   git clone <repository-url>
   cd shecare-frontend
```
2. **Install Dependencies**
```bash
npm install
```
3. **Configure environment**
- Update API endpoints in respective components

- Configure base URL in Settings if needed
4. **Start development server**
```bash
npm run dev
```
5. **Build for production**
```bash
npm run build
```

## API Integration
### Endpoints Used
- GET /api/users - User data and statistics
- GET /api/tips - AI-generated health tips
- GET /api/prescriptions - Prescription analytics
- GET /api/participants - Patient data
- GET /api/practitioners - Healthcare provider data
- GET /api/admins - Administrator data

## Customization
### Adding New Pages
1. Create component in components/pages/

2. Add route in App.jsx
3. Create corresponding CSS file in styles/
4. Update sidebar navigation if needed

### Theme Customization
. Modify CSS variables in global styles
. Update ThemeContext for additional theme options
. Extend color schemes in component styles

### Responsive Design
The application is built with mobile-first approach:

1. Flexible grid layouts
2. Responsive typography
3. Mobile-optimized navigation
4. Touch-friendly interactive elements

## Contributing
1. Fork the repository
2. Create feature branch (git checkout -b feature/AmazingFeature)
3. Commit changes (git commit -m 'Add some AmazingFeature')
4. Push to branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License
This project is licensed under the MIT License 
