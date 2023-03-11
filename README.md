# version-verse-api

An educational project api based on the [chronos](https://chronos.framer.website/) feel.

# Goals

- Become familiar with [https://expressjs.com/](Express.js)
- Implementing a JWT auth
- DB management with [https://www.prisma.io/](Prisma)
- Debugging with [https://github.com/microsoft/vscode-js-debug](vscode-js-debug)

# Key takeways

- To be able to attach a debugger a process use an `--inspect` flag
- On hot reload the child processes are not being killed use `--tree-kill` flag with ts-node or `process.on('SIGTERM', () => process.exit())`
- Bcrypt's function hash or hashSync will take forever if you set rounds to your favorite number (69) to reproduce `hash(password, 69)`
