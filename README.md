# Bulk Action Manager

> Bulk Action Manager is a NestJS-based application designed to handle large-scale bulk operations efficiently. It allows users to perform bulk updates on different entities like contacts, companies, leads, opportunities, and tasks. The system utilizes advanced batch processing, logging, and full-text search capabilities to manage and monitor bulk actions effectively.

## Architecture
The application is structured around NestJS modules, leveraging TypeORM for database interactions and RabbitMQ for handling asynchronous batch processing. The architecture is designed for scalability and robustness, with a focus on efficient handling of bulk operations and real-time monitoring.

## Key Components:
- **Bulk Actions Module**: Manages bulk update operations.
- **Worker Module**: Handles the processing of bulk actions in batches.
- **Logging Module**: Captures detailed logs and statistics of bulk operations.
- **Database**: Uses PostgreSQL, leveraging full-text search capabilities for logs.
- **Message Broker**: RabbitMQ is used for queue management and ensuring reliable processing.

## Setup

- Clone the Repository
    - `git clone git@github.com:vithalreddy/bulk-action.git`
- Install Dependencies
    - `cd bulk-action`
    - `npm ci`
    - tested using node version 21
- Configure Environment
    - create `.env` file based on `.env.example`
- Docker Compose
    - `docker compose up -d`
    - we are using docker compose to setuo postgresql and rabbitmq for simplicity
- Database Setup
    - The application uses TypeORM's synchronize option for schema creation, which is suitable for development environments. This option automatically creates your database schema on every application launch.
    - we have included a utility npm cmd to seed the database
    - `npm run seed-db`
- Run the application
    - `npm run start`
- Now you can access the api swagger docs @ ` http://localhost:3000/api/docs` here port based on .env file config value.


> Before starting the application please check the file `.env.example` where we can configure our system based on resources and requirements.

## API Documentation
The API documentation is generated using Swagger and can be accessed at /api when the application is running. This provides interactive documentation where you can test out different endpoints.

### Endpoints Include:
- GET /bulk-actions: List all bulk actions with pagination which has all the data related to bulk action status, stats and progress.
- POST /bulk-actions: create an bulk action.
- GET /bulk-actions/{actionId}: Retrieve the status of a specific bulk action.
- GET /bulk-actions/{actionId}/stats: Get statistics of a specific bulk action, it get's updated in near real-time.
- GET /bulk-actions/{actionId}/logs: Fetch logs related to a specific bulk action and can filter logs.

## Explanation of Key Functionalities

### Filter and Update Mechanism

- **Filters**: Defined using JSON rules https://github.com/cachecontrol/json-rules-engine, filters determine which records are selected for updating. For example, a rule might target records where a field value is greater than a certain number.
- **Update Process**: Once the records are filtered, specified fields in these records are updated with new values. This could include changing status, modifying dates, or any other field present in the record.

### Batching Process
Batch processing ensures efficiency and scalability in handling bulk updates:

- **Batch Creation**: The entire set of records is divided into smaller subsets called batches.
- **Parallel Processing**: Each batch is processed independently, allowing for concurrent updates. This reduces the processing time significantly compared to sequential updates.


### Logging and Full-Text Search

Logs are systematically stored and retrieved using PostgreSQL's full-text search:

- **Log Storage**: Every significant action in the system, like the start/end of a batch or an update operation, is logged with details like timestamps and outcomes.
- **Full-Text Search**: PostgreSQL's full-text search capabilities enable querying logs based on text content. This is particularly useful for quickly finding specific logs among large volumes of log data.

### Horizontal Scalability
The system is designed for horizontal scalability:

- **Load Distribution**: By using RabbitMQ and batching, the workload is distributed across multiple instances or nodes.
- **Scalable Architecture**: The architecture supports adding more worker nodes to handle increased load, ensuring the system scales efficiently as the demand grows.



## Caveats

- The system is designed for batch processing; real-time updates may have a slight delay.
- Full-text search capabilities depend on the PostgreSQL configuration.

## Further Imrovemnts

#### Elastic Search Integration
- Implement Elasticsearch for advanced, scalable search capabilities and log analytics.

#### Rate Limiting with Redis
- Introduce Redis-based rate limiting to manage API usage and ensure system stability.

#### Real-time Updates with SSE
- Utilize Server-Sent Events (SSE) for real-time progress updates on bulk operations.

These enhancements focus on improving search functionality, maintaining system integrity, and enhancing user interactivity.

#### De-duplication
- **Method Development**: Implement a mechanism to detect and omit duplicate entities, primarily based on the 'email' field, to prevent redundant processing.
- **Logging Skipped Entries**: Ensure that all entities skipped due to duplication are recorded in the logs with a clear indication of being omitted.

#### Scheduling
- Add fields to your BulkAction entity to store the scheduled start time of the action.
- Implement a scheduling mechanism using cron jobs or a similar scheduling library that can trigger the execution of a bulk action at the specified time.
- Store the scheduled time in the database and use a background process to check for actions that need to be started. we had discussed this in our interview round 1

These sections will focus on enhancing data integrity and user experience by ensuring efficient data handling and providing more control over when bulk actions are executed.

### Related Links

- https://nestjs.com/
- https://typeorm.io/
- https://github.com/vinzdeveloper/json-rule-editor
- https://www.postgresql.org/docs/current/textsearch.html
