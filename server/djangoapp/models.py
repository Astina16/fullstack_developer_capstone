# Uncomment the following imports before adding the Model code

from django.db import models
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator


# Create your models here.

# <HINT> Create a Car Make model `class CarMake(models.Model)`:
# - Name
# - Description
# - Any other fields you would like to include in car make model
# - __str__ method to print a car make object
class CarMake(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)

    def __str__(self):
        return self.name  # Return the name for easy readability in the admin

# CarModel Model (Task 15 Context)
class CarModel(models.Model):
    # Many-to-one relationship with CarMake (one make can have many models)
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE) 

    # Choices for car type (sedan, SUV, wagon, etc.)
    CAR_TYPES = (
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('WAGON', 'Wagon'),
        # Add other types as needed
    )

    name = models.CharField(max_length=100)
    dealer_id = models.IntegerField() # Dealer associated with this model (Foreign Key placeholder)
    car_type = models.CharField(max_length=10, choices=CAR_TYPES)
    year = models.DateField() # Or models.IntegerField() depending on preference

    def __str__(self):
        return str(self.car_make) + " - " + self.name

# <HINT> Create a Car Model model `class CarModel(models.Model):`:
# - Many-To-One relationship to Car Make model (One Car Make has many
# Car Models, using ForeignKey field)
# - Name
# - Type (CharField with a choices argument to provide limited choices
# such as Sedan, SUV, WAGON, etc.)
# - Year (IntegerField) with min value 2015 and max value 2023
# - Any other fields you would like to include in car model
# - __str__ method to print a car make object
