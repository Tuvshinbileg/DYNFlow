from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout, get_user_model
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Log the user in
        login(request, user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    API endpoint for user login
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Create or get auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Log the user in
        login(request, user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    API endpoint for user logout
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Delete the user's token
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        
        # Logout
        logout(request)
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for viewing and updating user profile
    GET/PUT/PATCH /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    API endpoint for changing password
    POST /api/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'old_password': ['Wrong password.']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Update token
            Token.objects.filter(user=user).delete()
            Token.objects.create(user=user)
            
            return Response({
                'message': 'Password updated successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckAuthView(APIView):
    """
    API endpoint to check if user is authenticated
    GET /api/auth/check/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'isAuthenticated': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
