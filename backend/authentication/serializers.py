from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'avatar', 'bio', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                  'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create a new user with encrypted password"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate and authenticate user"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Try to get user by email
            try:
                user = User.objects.get(email=email)
                # Authenticate with username (since Django uses username for auth)
                user = authenticate(
                    request=self.context.get('request'),
                    username=user.username,
                    password=password
                )
                
                if not user:
                    raise serializers.ValidationError(
                        'Unable to log in with provided credentials.'
                    )
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.'
                )
        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".'
            )
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Validate that new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs
