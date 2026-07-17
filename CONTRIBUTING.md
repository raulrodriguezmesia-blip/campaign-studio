# Contributing to Campaign Studio

Thank you for your interest in contributing to Campaign Studio! This document provides guidelines and instructions for contributing.

## 📋 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🔄 How to Contribute

### Fork and Branch
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Pull Request Guidelines
- Ensure any install or build dependencies are removed before commit
- Update the README.md with details of changes to the interface
- Ensure code follows the existing style
- Self-review before submitting PR

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run lighthouse audit
lhci autorun
```

## 📝 Coding Standards

- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic
- Follow the existing code style
- Ensure cross-browser compatibility

## 🚀 Deployment Process

1. All changes must pass CI checks
2. Merge to `main` triggers automatic deployment
3. Production deployment to Vercel/Netlify
4. Monitor performance metrics

## 📦 Project Structure

```
campaign-studio/
├── frontend/          # Frontend source files
├── backend/           # Backend API
├── dist/              # Production build
├── tests/             # Test files
├── docs/              # Documentation
└── .github/           # GitHub workflows
```

## 🤝 Community

- Open an issue to discuss any major changes
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

## 📧 Contact

For questions or concerns, please open an issue or contact the maintainers.

Thank you for contributing!