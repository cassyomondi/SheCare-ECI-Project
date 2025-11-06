import sys
import os
from logging.config import fileConfig

from alembic import context

# ensure your app is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

# Import your Flask app and db
from app import app, db
from app.models.models import Base  # your SQLAlchemy models

# Alembic Config object
config = context.config

# Logging
fileConfig(config.config_file_name)
import logging
logger = logging.getLogger('alembic.env')

# Metadata for autogenerate support
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = app.config['SQLALCHEMY_DATABASE_URI']
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = db.engine  # directly use SQLAlchemy engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# Run inside Flask app context
with app.app_context():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()
