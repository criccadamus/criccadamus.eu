type StartRequestContext = {
  env: Env;
  ctx: ExecutionContext;
};

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: StartRequestContext;
    };
  }
}

declare module "@tanstack/router-core" {
  interface Register {
    server: {
      requestContext: StartRequestContext;
    };
  }
}
