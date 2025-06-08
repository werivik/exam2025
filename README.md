# Holidaze

A modern accommodation booking website that allows users to search for venues, make bookings, and manage their reservations through an intuitive interface. Features dual user roles with customer booking capabilities and venue management tools for property owners.

## Description

Holidaze is a comprehensive front-end booking application developed as part of the Noroff FED2 exam project. The platform demonstrates advanced planning, design, development, and deployment skills through a complete booking ecosystem that serves both customers seeking accommodations and venue managers looking to list their properties.

The application provides a seamless booking experience with modern UI/UX design principles, responsive layouts, and smooth user interactions. Built with a focus on accessibility and user experience, Holidaze offers different functionality levels based on user roles, from guest browsing to full venue management capabilities.

## Built With

- [React](https://reactjs.org/) - Frontend framework for building user interfaces
- [React Router](https://reactrouter.com/) - Declarative routing for React applications
- [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library for React
- [CSS Modules](https://github.com/css-modules/css-modules) - Localized CSS styling
- [Holidaze API](https://v2.api.noroff.dev/docs/static/index.html#/) - Backend API for venue and booking data

## Getting Started

### Installing

To get started with Holidaze, clone the repository and install the required dependencies.

1. Clone the repo:
```bash
git clone https://github.com/werivik/exam2025.git
```

2. Navigate to the project directory:
```bash
cd holidaze
```

3. Install the dependencies:
```bash
npm install
```

### Running

To run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

To build for production:

```bash
npm run build
```

## Features

**Guest Users**
- Browse available venues without registration
- View detailed venue information and amenities
- Access user registration to unlock booking features

**Registered Customers**
- Complete venue browsing and detailed view capabilities
- View venue owner profiles and property details
- Book accommodations with date selection
- Access personal profile with avatar and banner customization
- View and manage upcoming bookings
- Edit or cancel existing reservations

**Venue Managers**
- All customer functionality plus venue management tools
- Create new venue listings with comprehensive details
- Edit existing venue information and availability
- Delete venues from their portfolio
- Access venue manager interface with code: **4321**

**Core Application Features**
- Full authentication system with role-based access
- Advanced search and filtering for venue discovery
- Interactive calendar component for availability display
- Responsive design optimized for desktop and mobile devices
- Smooth animations and transitions throughout the interface

## User Roles

The platform supports three distinct user levels:

**Guest Access:** Browse venues and view details without registration
**Customer Account:** Full booking capabilities with profile management
**Venue Manager:** Complete venue management plus all customer features

## Dependencies

The project uses the following key dependencies:

- react: ^19.0.0
- react-dom: ^19.0.0
- react-router: ^7.4.0
- react-router-dom: ^7.4.0
- framer-motion: ^12.8.0
- lodash.debounce: ^4.0.8
- prop-types: ^15.8.1
- netlify-cli: ^20.1.1

## Contributing

This project was developed as an educational assignment. If you'd like to suggest improvements or report issues:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add suggested improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request with a detailed description

## Contact

[LinkedIn](https://www.linkedin.com/in/weronika-vik-0844022a6/)
[GitHub](https://github.com/werivik)

**Live Application:** [Holidaze on Netlify](https://werivik-holidaze.netlify.app/)

**Project Resources:**
- [GitHub Repository](https://github.com/werivik/exam2025)
- [Figma Design Files](https://www.figma.com/design/Q6jYqVIakvz6zSBQstqGGR/Holidaze---Exam-2025?node-id=0-1&t=9dF13wpEGL3M4qp8-1)
- [Project Kanban Board](https://github.com/users/werivik/projects/8)

## License

This project is licensed for educational purposes as part of the Noroff Front-End Development course (FED2 Exam Project 2025).

## Acknowledgments

- Noroff School for providing the project requirements and API documentation
- The React and Framer Motion communities for excellent documentation
- Figma for design collaboration tools
- Netlify for seamless deployment and hosting
