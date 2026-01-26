from logging.config import fileConfig

from alembic import context
from flask import current_app

# Alembic Config object
config = context.config

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Get the db from Flask-Migrate extension (already attached to current_app)
db = current_app.extensions["migrate"].db
target_metadata = db.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = current_app.config.get("SQLALCHEMY_DATABASE_URI")
    if not url:
        raise RuntimeError("SQLALCHEMY_DATABASE_URI is not set")

    # Alembic uses % interpolation in config strings; escape % if present
    context.configure(
        url=url.replace("%", "%%"),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = db.engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
