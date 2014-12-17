from superdesk.utc import utc
import logging
from superdesk.errors import SuperdeskApiError

logger = logging.getLogger(__name__)


class IngestService():
    """Base ingest service class."""

    def get_items(self, guid):
        raise LookupError()

    def _update(self, provider):
        raise NotImplementedError()

    def update(self, provider):
        if provider.get('is_closed', False):
            raise SuperdeskApiError.internalError(message='Ingest Provider is closed', payload='')
        else:
            return self._update(provider) or []

    def add_timestamps(self, item):
        """
        Adds _created, firstcreated, versioncreated and _updated timestamps
        :param item:
        :return:
        """

        item['firstcreated'] = utc.localize(item['firstcreated'])
        item['versioncreated'] = utc.localize(item['versioncreated'])
