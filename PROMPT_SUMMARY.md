I would like to sum up how I prompted the AI throughout the project.

1. Planning phase: I prompted the AI to help outline the project goals, tasks, and milestones.
2. Based on the tech decisions, I created the expected feature list that was polished later.
3. Based on the technical boundaries and the expected feature list, I created a MILESTONES.md file to help understand the project.
4. I started the implementation.

What blocked me in the implementation phase:

- During the project initialization phase, the AI frequently skipped implementing the expected technologies, like nginx and SQLite Docker images.
- I manually tested the implemented applications before continuing with the next steps.
- There were many problems with the SQLite database setup because the AI tried to use only the locally installed SQLite and missed the Docker image multiple times. After clarification, I realized that the alpine/sqlite Docker image did not work, and the agent recommended another solution.
- Milestone 2 and Milestone 3 were easy thanks to the good foundation.

Unfortunately, I could not implement every planned feature due to the time spent on initialization.
