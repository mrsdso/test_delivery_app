from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from deliveries.admin import custom_admin_site, mass_export_admin_site

urlpatterns = [
    path('admin/mass-import/', custom_admin_site.mass_import_view, name='mass_import'),
    path('admin/mass-export/', mass_export_admin_site.mass_export_view, name='mass_export'),
    path('admin/', admin.site.urls),
    path('api/', include('deliveries.urls')),
    path('api/auth/', include('rest_framework.urls')),  # Для формы логина DRF
    path('api/token-auth/', views.obtain_auth_token),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
