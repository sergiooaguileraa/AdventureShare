from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROLES = (
        ('viajero', 'Viajero'),
        ('organizador', 'Organizador'),
    )
    role = models.CharField(max_length=12, choices=ROLES, default='viajero')

    # Foto de perfil: se guardará en MEDIA_ROOT/avatars/
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    # Breve descripción del usuario
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
