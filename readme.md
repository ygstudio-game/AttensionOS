# AttentionOS with FocusLens

A privacy-first, browser-based attention tracking system built with MERN stack and Next.js. Transform passive web browsing into an adaptive, attention-aware digital experience.

## 🎯 Features

### Core Functionality
- **Real-time Attention Tracking**: Uses MediaPipe FaceMesh and TensorFlow.js for gaze estimation
- **Privacy-First**: All video processing happens locally in the browser - no data transmission
- **Smart Interventions**: Visual feedback (blur, grayscale) when attention drops
- **Session Analytics**: Deep Work Minutes tracking and attention heatmaps
- **Export Capabilities**: Download session data for offline analysis

### Technical Highlights
- **Next.js 14** with App Router
- **TypeScript** throughout for type safety
- **Zustand** for state management
- **Tailwind CSS** with custom ShadCN UI components
- **MERN Stack** backend with MongoDB
- **WebAssembly** ready for ML performance optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Install Dependencies**
```bash
# Frontend dependencies
cd frontend && pnpm install @mediapipe/tasks-vision @tensorflow/tfjs zustand react-use-gesture react-spring d3-scale d3-array

# Backend dependencies  
cd backend && pnpm install @tensorflow/tfjs-node sharp jimp
```

2. **Environment Setup**
```bash
# Backend environment variables
cd backend
cp .env.example .env  # Create your .env file with MongoDB connection string
```

3. **Start Development Servers**
```bash
# Start backend (port 5000)
cd backend && pnpm dev

# Start frontend (port 3000) - in a new terminal
cd frontend && pnpm dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
attention-os/
├── frontend/                    # Next.js 14 application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # React components
│   │   │   ├── attention/       # Core attention tracking UI
│   │   │   ├── dashboard/       # Analytics components
│   │   │   └── ui/              # ShadCN UI components
│   │   ├── lib/
│   │   │   ├── vision/          # Computer vision engine
│   │   │   └── store/           # Zustand state management
│   │   └── app/page.tsx         # Main application page
│   └── package.json
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── controllers/         # API controllers
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   └── config/              # Database and environment config
│   └── package.json
├── INSTALLATION_GUIDE.md        # Detailed installation instructions
└── README.md                    # This file
```

## 🔧 Architecture

### Frontend Architecture
- **AttentionEngine**: Core webcam processing component
- **Vision Engine**: MediaPipe/TensorFlow.js integration
- **State Management**: Zustand with optimized selectors
- **UI Components**: Custom Card, Progress, and Button components
- **Analytics Dashboard**: Real-time metrics and session summaries

### Backend Architecture  
- **Telemetry Controller**: Session management and data aggregation
- **MongoDB Models**: Session data with heatmap storage
- **RESTful API**: Comprehensive endpoints for session management
- **Analytics Endpoints**: Time-based data aggregation and export

## 🎨 User Interface

### Reader Mode
- Enhanced reading experience with attention-aware features
- Real-time focus score display
- Privacy controls and camera status indicators
- Adaptive UI that responds to attention levels

### Analytics Dashboard
- Session metrics (Deep Work Minutes, distraction count)
- Focus distribution charts
- Historical trends and insights
- Data export functionality

## 🔒 Privacy & Security

- **Local Processing**: All video analysis happens in-browser
- **No Data Transmission**: Raw video frames never leave the device
- **User Consent**: Clear privacy notices and opt-in controls
- **GDPR Compliant**: No persistent user data without consent

## 📊 Attention States

The system classifies attention into four states:

1. **FOCUSED** (75-100%): Deep reading and comprehension
2. **SKIMMING** (50-74%): Rapid content scanning
3. **DISTRACTED** (25-49%): Attention drift and mindless scrolling
4. **FATIGUED** (0-24%): Eye strain and mental fatigue

## 🚀 Performance Optimizations

- **Frame Throttling**: ~30fps processing for smooth performance
- **Web Workers**: ML processing off main thread (ready for implementation)
- **State Optimization**: Efficient Zustand selectors
- **Database Optimization**: Field exclusion for large datasets

## 📈 Analytics & Metrics

### Core Metrics
- **Deep Work Minutes (DWM)**: Verified focused time
- **Focus Score**: Real-time attention percentage (0-100%)
- **Distraction Rate**: Percentage of distracted frames
- **Fatigue Rate**: Blink rate and eye closure detection
- **Alignment Rate**: Head pose and gaze direction accuracy

### Session Analytics
- Total sessions and duration
- Average focus scores over time
- Distraction patterns and trends
- Reading efficiency metrics

## 🔧 Development

### Adding New Features
1. Extend the `FrameData` interface in `frontend/src/lib/vision/types.ts`
2. Update the `AttentionEngine` class with new detection logic
3. Add state management in `frontend/src/lib/store/attention-store.ts`
4. Create UI components in the appropriate directories
5. Add backend endpoints if data persistence is needed

### Testing
```bash
# Frontend tests (when added)
cd frontend && pnpm test

# Backend tests (when added)  
cd backend && pnpm test
```

### Building for Production
```bash
# Build frontend
cd frontend && pnpm build

# Build backend
cd backend && pnpm build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Camera Access Issues
- Ensure camera permissions are granted in browser
- Check that no other applications are using the camera
- Try refreshing the page if camera fails to initialize

### Performance Issues
- Close other browser tabs and applications
- Ensure your device meets minimum requirements
- Consider reducing video resolution in camera settings

### TypeScript Errors
- Run `pnpm install` to ensure all dependencies are installed
- Check that TypeScript versions are compatible
- Verify import paths are correct

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the installation guide
3. Create an issue on GitHub with detailed error information

---

**Transform your digital reading experience with AttentionOS - where technology enhances human focus, not distracts from it.**