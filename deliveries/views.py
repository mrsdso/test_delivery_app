from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated  
from rest_framework.response import Response
from rest_framework import status
import logging
from .models import (
    TransportModel, PackagingType, ServiceType, DeliveryStatus, Delivery, TechState  
)
from .serializers import (
    TransportModelSerializer, PackagingTypeSerializer, ServiceTypeSerializer,
    DeliveryStatusSerializer, DeliverySerializer, TechStateSerializer  
)
from django.urls import get_resolver
from rest_framework.decorators import api_view

@api_view(['GET'])
def api_routes(request):
    resolver = get_resolver()
    routes = []
    for url_pattern in resolver.url_patterns:
        try:
            pattern = str(url_pattern.pattern)
        except Exception:
            pattern = str(url_pattern)
        routes.append(pattern)
    return Response({'routes': routes})
logger = logging.getLogger(__name__)

class TransportModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransportModel.objects.all()
    serializer_class = TransportModelSerializer

class PackagingTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PackagingType.objects.all()
    serializer_class = PackagingTypeSerializer

class ServiceTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

class DeliveryStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer

class DeliveryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  
    queryset = Delivery.objects.all().order_by('-created_at')
    serializer_class = DeliverySerializer

    def perform_create(self, serializer):
        logger.info(f"Creating delivery with user: {self.request.user}")
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        logger.info(f"Updating delivery {serializer.instance.id} with user: {self.request.user}")
        # При обновлении не меняем created_by, но убеждаемся что оно есть
        if not serializer.instance.created_by:
            logger.warning(f"Delivery {serializer.instance.id} has no created_by, setting to current user")
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Create request data: {request.data}")
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating delivery: {str(e)}")
            return Response(
                {"error": f"Ошибка создания доставки: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Update request data for delivery {kwargs.get('pk')}: {request.data}")
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating delivery {kwargs.get('pk')}: {str(e)}")
            return Response(
                {"error": f"Ошибка обновления доставки: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class TechStateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TechState.objects.all()
    serializer_class = TechStateSerializer