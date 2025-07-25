# Generated by Django 5.2.4 on 2025-07-10 13:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deliveries', '0005_alter_delivery_travel_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='delivery',
            name='status',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='deliveries.deliverystatus', verbose_name='Статус доставки'),
            preserve_default=False,
        ),
    ]
