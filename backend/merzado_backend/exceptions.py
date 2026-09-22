from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Standardizes error responses across all APIs and prevents internal
    server tracebacks from leaking in production mode.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # If response.data is a dict or list, preserve it cleanly
        data = response.data
        if isinstance(data, list):
            response.data = {'errors': data}
        elif isinstance(data, dict):
            # If detail is present, keep it accessible at root
            if 'detail' not in data and len(data) == 1 and 'non_field_errors' in data:
                response.data = {'detail': data['non_field_errors'][0]}
        return response

    # Unhandled 500 Server Error
    logger.error(f"Unhandled server exception: {str(exc)}", exc_info=True)

    if not settings.DEBUG:
        return Response(
            {'detail': 'An internal server error occurred. Please contact the administrator.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return None
