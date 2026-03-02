# Rehab-Canvas System Architecture

## Proposed System Architecture

### Mermaid Diagram (Interactive)

```mermaid
graph TB
    subgraph VIZ["<b>Visualization & Reporting Layer</b>"]
        CHARTS["Progress Charts<br/>& Trend Analysis"]
        GRAPHS["Performance Graphs<br/>& Comparison Tools"]
        EXPORT["PDF/Excel<br/>Report Export"]
    end

    subgraph UI["<b>User Interface Layer (Frontend)</b><br/>React + TypeScript + Vite"]
        LANDING["Landing Page &<br/>Authentication"]
        PATIENT["Patient Dashboard<br/>• Exercise Selection<br/>• Live Canvas<br/>• Personal Progress"]
        THERAPIST["Therapist Dashboard<br/>• Patient Management<br/>• Analytics Overview<br/>• Clinical Notes"]
        WEBCAM["Webcam Canvas Component<br/>MediaPipe Hand Tracking"]
    end

    subgraph ANALYTICS["<b>Analytics & AI Layer</b>"]
        MOTION["Motion Analysis<br/>• Stability Calc<br/>• Smoothness Calc<br/>• Path Comparison"]
        METRICS["Performance Metrics<br/>• Accuracy Scoring<br/>• Completion Time<br/>• Comparative Stats"]
        PREDICT["Trend Prediction<br/>& Gamification<br/>• Milestones<br/>• Alerts"]
    end

    subgraph APP["<b>Application Layer (Backend)</b><br/>Express.js + Node.js"]
        AUTH["Authentication<br/>& Authorization<br/>• Login/Register<br/>• JWT/Session"]
        SESSION["Session Management<br/>• Create Session<br/>• Store Metrics<br/>• Retrieve History"]
        EXERCISE["Exercise<br/>Management<br/>• CRUD Ops<br/>• Templates"]
        USER["User Management<br/>• Patient CRUD<br/>• Therapist CRUD<br/>• Assignment"]
        PROGRESS["Progress Tracking<br/>• Aggregate Stats<br/>• Trend Analysis<br/>• Goal Setting"]
        THERAPIST_SVC["Therapist Services<br/>• Patient Assign<br/>• Notes & Obs"]
    end

    subgraph DB["<b>Database Layer (PostgreSQL)</b>"]
        USER_DB["User Data Storage<br/>• Patients<br/>• Therapists<br/>• Credentials"]
        EXERCISE_DB["Exercise Library<br/>• Line, Circle<br/>• Square, Shapes<br/>• Target Shapes"]
        SESSION_DB["Session Records<br/>• Path Data<br/>• Metrics<br/>• Timestamps"]
        PROGRESS_DB["Progress Data<br/>• Aggregated Stats<br/>• Improvement Trend"]
        NOTES_DB["Therapist Notes<br/>• Clinical Obs.<br/>• Recommendations"]
    end

    subgraph EXTERNAL["<b>External Services & Dependencies</b>"]
        MEDIAPIPE["MediaPipe Hands<br/>ML Hand Tracking"]
        WEBRTC["WebRTC/Camera API<br/>Webcam Access"]
        CLOUD["Cloud Storage<br/>Optional"]
    end

    VIZ --> UI
    UI --> ANALYTICS
    ANALYTICS --> APP
    APP --> DB
    EXTERNAL -.->|ML Model| WEBCAM
    EXTERNAL -.->|Camera Feed| UI

    classDef vizStyle fill:#B3D9FF,stroke:#0066CC,stroke-width:2px
    classDef uiStyle fill:#C1F0C1,stroke:#2D882D,stroke-width:2px
    classDef analyticsStyle fill:#E6D0FF,stroke:#8B31C7,stroke-width:2px
    classDef appStyle fill:#FFE6B3,stroke:#CC8800,stroke-width:2px
    classDef dbStyle fill:#FFB3BA,stroke:#CC0000,stroke-width:2px
    classDef extStyle fill:#E0E0E0,stroke:#666666,stroke-width:2px

    class CHARTS,GRAPHS,EXPORT vizStyle
    class LANDING,PATIENT,THERAPIST,WEBCAM uiStyle
    class MOTION,METRICS,PREDICT analyticsStyle
    class AUTH,SESSION,EXERCISE,USER,PROGRESS,THERAPIST_SVC appStyle
    class USER_DB,EXERCISE_DB,SESSION_DB,PROGRESS_DB,NOTES_DB dbStyle
    class MEDIAPIPE,WEBRTC,CLOUD extStyle
```

### ASCII Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Visualization & Reporting Layer                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   Progress Charts    │  │  Performance Graphs  │  │  PDF/Excel       │  │
│  │   & Trend Analysis   │  │  & Comparison Tools  │  │  Report Export   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       User Interface Layer (Frontend)                       │
│                         React + TypeScript + Vite                           │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Landing Page    │    Authentication    │    Role-Based Routing    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Patient Dashboard       │       Therapist Dashboard                │    │
│  │  - Exercise Selection    │       - Patient Management               │    │
│  │  - Live Canvas           │       - Analytics Overview               │    │
│  │  - Personal Progress     │       - Patient Details View             │    │
│  │  - Session History       │       - Clinical Notes                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Webcam Canvas Component (MediaPipe Integration)                    │    │
│  │  - Real-time Hand Tracking  │  - Air Drawing Capture                │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Analytics & AI Layer                                │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Motion Analysis     │  │  Performance Metrics │  │  Trend Prediction│  │
│  │  - Stability Calc    │  │  - Accuracy Scoring  │  │  & Gamification  │  │
│  │  - Smoothness Calc   │  │  - Completion Time   │  │  - Milestones    │  │
│  │  - Path Comparison   │  │  - Comparative Stats │  │  - Alerts        │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Application Layer (Backend)                            │
│                         Express.js + Node.js                                │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Authentication      │  │  Session Management  │  │  Exercise        │  │
│  │  & Authorization     │  │  - Create Session    │  │  Management      │  │
│  │  - Login/Register    │  │  - Store Metrics     │  │  - CRUD Ops      │  │
│  │  - JWT/Session       │  │  - Retrieve History  │  │  - Templates     │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  User Management     │  │  Progress Tracking   │  │  Therapist       │  │
│  │  - Patient CRUD      │  │  - Aggregate Stats   │  │  Services        │  │
│  │  - Therapist CRUD    │  │  - Trend Analysis    │  │  - Patient Assign│  │
│  │  - Patient-Therapist │  │  - Goal Setting      │  │  - Notes & Obs   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Database Layer (PostgreSQL)                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  User Data Storage   │  │  Exercise Library    │  │  Session Records │  │
│  │  - Patients          │  │  - Line, Circle      │  │  - Path Data     │  │
│  │  - Therapists        │  │  - Square, Shapes    │  │  - Metrics       │  │
│  │  - Credentials       │  │  - Target Shapes     │  │  - Timestamps    │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │  Progress Data       │  │  Therapist Notes     │                        │
│  │  - Aggregated Stats  │  │  - Clinical Obs.     │                        │
│  │  - Improvement Trend │  │  - Recommendations   │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      External Services & Dependencies                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  MediaPipe Hands     │  │  WebRTC/Camera API   │  │  Cloud Storage   │  │
│  │  (ML Hand Tracking)  │  │  (Webcam Access)     │  │  (Optional)      │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. **Visualization & Reporting Layer**
- **Progress Charts & Trend Analysis**: Line/bar charts showing improvement over time
- **Performance Graphs & Comparison**: Side-by-side session comparisons, therapist vs patient view
- **PDF/Excel Report Export**: Generate downloadable reports for medical records

### 2. **User Interface Layer (Frontend)**
- **Technology**: React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Patient Interface**: Exercise selection, live air-drawing canvas, personal metrics
- **Therapist Interface**: Multi-patient dashboard, analytics, clinical notes
- **Webcam Canvas**: Real-time hand tracking visualization with MediaPipe

### 3. **Analytics & AI Layer**
- **Motion Analysis**: Calculate stability, smoothness, path deviation
- **Performance Metrics**: Scoring algorithms for exercise accuracy and completion
- **Trend Prediction**: ML-based improvement forecasting, gamification elements

### 4. **Application Layer (Backend)**
- **Technology**: Express.js, Node.js, TypeScript
- **REST API**: User authentication, session CRUD, exercise management
- **Business Logic**: Patient-therapist assignment, progress aggregation
- **Security**: JWT/session-based auth, role-based access control

### 5. **Database Layer**
- **Technology**: PostgreSQL with Drizzle ORM
- **Schema**: Users, Exercises, Sessions, Progress, TherapistNotes
- **Storage**: Hand motion path data (JSON), metrics, user profiles

### 6. **External Services**
- **MediaPipe Hands**: Google's hand landmark detection ML model
- **Browser APIs**: WebRTC for camera access, Canvas API for drawing
- **Optional**: Cloud storage for session recordings, backup services

---

## Data Flow Example: Patient Exercise Session

```
1. Patient logs in → Frontend auth → Backend validates → JWT issued
2. Patient selects exercise → Frontend fetches from DB → Display instructions
3. Webcam activated → MediaPipe tracks hand → Real-time landmarks captured
4. Patient draws in air → Frontend records path data → Visualize on canvas
5. Session ends → Calculate metrics (stability, smoothness, accuracy)
6. Send to backend → Store in sessions table → Update progress aggregates
7. Display results → Show graphs → Compare with previous sessions
8. Therapist reviews → Access patient detail page → Add clinical notes
```

---

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Shadcn UI |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL, Drizzle ORM |
| **ML/CV** | MediaPipe Hands (TensorFlow.js) |
| **APIs** | WebRTC, Canvas API, REST API |
| **Visualization** | Recharts, D3.js (optional) |
| **Auth** | JWT / Session-based authentication |
| **Deployment** | Vite (dev), Node.js server, PostgreSQL instance |

---

## Security & Privacy Considerations

- **Data Encryption**: All patient data encrypted at rest and in transit
- **HIPAA Compliance**: Follow healthcare data protection guidelines
- **Role-Based Access**: Therapists can only access assigned patients
- **Session Management**: Secure token expiration and refresh mechanisms
- **Camera Permissions**: User consent required, no video storage unless opted-in

---

## Scalability & Future Enhancements

1. **Multi-language Support**: i18n for regional accessibility
2. **Mobile App**: React Native version for home rehabilitation
3. **Advanced ML Models**: Custom-trained models for specific conditions
4. **Telemedicine Integration**: Video consultation with therapists
5. **Wearable Integration**: Support for smart gloves or sensors
6. **Cloud Deployment**: AWS/Azure for multi-clinic deployment

---

## System Requirements

### Minimum Hardware
- **Camera**: 720p webcam (30fps recommended)
- **Processor**: Dual-core 2.0GHz or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+

### Software Dependencies
- Node.js 18+
- PostgreSQL 14+
- Modern browser with WebRTC support

---

*This architecture is designed to be modular, scalable, and maintainable while keeping patient care and data security as top priorities.*
