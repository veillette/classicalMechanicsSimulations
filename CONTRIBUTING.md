# Contributing to Classical Mechanics Simulations

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Adding new simulations
- Becoming a maintainer

## We Develop with Github

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker]

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/veillette/classicalMechanicsSimulations/issues); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

- 2 spaces for indentation rather than tabs
- Run `npm run lint` for style checking
- Run `npm run format` to format code with Prettier
- Run `npm run fix` to automatically fix linting and formatting issues

## Development Guidelines

### Code Quality

- Write TypeScript with proper type annotations
- Follow the existing code structure and patterns
- Keep functions focused and modular
- Add comments for complex physics calculations

### Physics Accuracy

- Ensure numerical solvers maintain stability
- Verify energy conservation where applicable
- Test edge cases (e.g., zero mass, infinite spring constants)
- Document any approximations or simplifications

### Accessibility

- Maintain keyboard navigation support
- Ensure screen reader compatibility
- Follow WCAG guidelines for color contrast
- Test with voicing features enabled

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
