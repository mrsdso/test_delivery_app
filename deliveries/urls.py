from rest_framework.routers import DefaultRouter
from .views import (
    TransportModelViewSet, PackagingTypeViewSet, ServiceTypeViewSet,
    DeliveryStatusViewSet, DeliveryViewSet, TechStateViewSet
)

router = DefaultRouter()
router.register(r'transportmodels', TransportModelViewSet, basename='transportmodel')
router.register(r'transport-models', TransportModelViewSet, basename='transportmodel-old')
router.register(r'packagings', PackagingTypeViewSet, basename='packagingtype')
router.register(r'packaging-types', PackagingTypeViewSet, basename='packagingtype-old')
router.register(r'services', ServiceTypeViewSet, basename='servicetype')
router.register(r'service-types', ServiceTypeViewSet, basename='servicetype-old')
router.register(r'techstates', TechStateViewSet, basename='techstate')
router.register(r'tech-states', TechStateViewSet, basename='techstate-old')
router.register(r'statuses', DeliveryStatusViewSet, basename='status')
router.register(r'deliveries', DeliveryViewSet, basename='delivery')

urlpatterns = router.urls