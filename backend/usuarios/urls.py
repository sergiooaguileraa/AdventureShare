# backend/usuarios/urls.py
from django.urls import path
from .views import CurrentUserView, ChangePasswordView

urlpatterns = [
    # GET  /api/me/        -> devuelve tus datos
    # PATCH /api/me/       -> actualiza username, bio y avatar
    path('me/', CurrentUserView.as_view(), name='current-user'),

    # POST /api/me/password/  -> cambia contraseña
    path('me/password/', ChangePasswordView.as_view(), name='change-password'),
]
