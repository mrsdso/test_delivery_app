from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class TransportModel(models.Model):
    name = models.CharField(max_length=128)

    def __str__(self):
        return self.name

class PackagingType(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name

class ServiceType(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name

class DeliveryStatus(models.Model):
    name = models.CharField(max_length=32)

    def __str__(self):
        return self.name

class TechState(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

def validate_pdf(file):
    if not file.name.lower().endswith('.pdf'):
        raise ValidationError("Только PDF-файлы разрешены.")

def validate_csv(file):
    if not file.name.lower().endswith('.csv'):
        raise ValidationError("Только CSV-файлы разрешены.")

class Delivery(models.Model):
    transport_model = models.ForeignKey(TransportModel, on_delete=models.PROTECT)
    vehicle_number = models.CharField(max_length=64)
    packaging = models.ForeignKey(PackagingType, on_delete=models.PROTECT)
    service = models.ForeignKey(ServiceType, on_delete=models.PROTECT)
    tech_state = models.ForeignKey(TechState, on_delete=models.PROTECT, verbose_name="Тех. состояние")
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    send_time = models.DateTimeField()
    delivery_time = models.DateTimeField()
    file = models.FileField(upload_to="deliveries/", null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    travel_time = models.TimeField("Время в пути", null=True, blank=True)
    from_address = models.CharField("Откуда", max_length=255, blank=True)
    to_address = models.CharField("Куда", max_length=255, blank=True)
    media_file = models.FileField(
        "Медиафайл (PDF)", upload_to="media_files/", null=True, blank=True, validators=[validate_pdf]
    )
    log_file = models.FileField(
        "Файл логирования (CSV)", upload_to="log_files/", null=True, blank=True, validators=[validate_csv]
    )
    comment = models.TextField("Комментарий", blank=True)
    status = models.ForeignKey(DeliveryStatus, on_delete=models.PROTECT, verbose_name="Статус доставки")

    def __str__(self):
        # Выводим, например: "IVECO/ABC123, 2025-07-10, До клиента"
        return f"{self.transport_model} / {self.vehicle_number}, {self.send_time.date()}, {self.service}"