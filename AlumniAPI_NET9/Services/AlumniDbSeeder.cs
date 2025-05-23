using AlumniAPI.Data;
using AlumniAPI.Models;
using Microsoft.VisualBasic.FileIO;
using System.Globalization;

namespace AlumniAPI.Services
{
    public static class AlumniDbSeeder
    {
        public static void Seed(AlumniDbContext db)
        {
            string path = @"C:\Users\nvovo\Downloads\AlumniAPI_NET9\Resource\GraduateFullData_English.csv";
            if (!File.Exists(path)) return;

            if (db.Graduates.Any()) return; // Skip if already seeded

            var userDict = new Dictionary<string, User>();
            int count = 0;

            using var parser = new TextFieldParser(path);
            parser.SetDelimiters(",");
            parser.HasFieldsEnclosedInQuotes = true;
            parser.ReadLine(); // skip header

            while (!parser.EndOfData)
            {
                string[] parts = parser.ReadFields();
                if (parts == null || parts.Length != 29) continue;

                try
                {
                    string username = parts[9].Trim();
                    string passwordHash = BCrypt.Net.BCrypt.HashPassword(parts[10].Trim());

                    if (!userDict.TryGetValue(username, out var user))
                    {
                        user = new User
                        {
                            Username = username,
                            PasswordHash = passwordHash
                        };
                        db.Users.Add(user);
                        userDict[username] = user;
                    }

                    if (!DateTime.TryParseExact(parts[4], "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var gradDate))
                        continue;

                    var graduate = new Graduate
                    {
                        FirstName = parts[1],
                        LastName = parts[2],
                        AcademicEntryYear = int.Parse(parts[3]),
                        GraduationDate = gradDate,
                        DegreeGrade = double.Parse(parts[5], CultureInfo.InvariantCulture),
                        Email = parts[6],
                        PersonalWebsite = parts[7],
                        User = user,
                        Phones = new List<Phone>
                        {
                            new Phone { Number = parts[11], Type = parts[12] }
                        },
                        SocialMedias = new List<SocialMedia>
                        {
                            new SocialMedia { Type = parts[13], Url = parts[14] }
                        },
                        Employments = new List<Employment>
                        {
                            new Employment
                            {
                                Organization = parts[15],
                                OrganizationSite = parts[16],
                                From = DateTime.ParseExact(parts[17], "dd/MM/yyyy", CultureInfo.InvariantCulture),
                                To = DateTime.ParseExact(parts[18], "dd/MM/yyyy", CultureInfo.InvariantCulture),
                                JobType = parts[19],
                                JobDescription = parts[20],
                                RelatedField = parts[21],
                                Address = new Address
                                {
                                    Street = parts[22],
                                    Number = parts[23],
                                    City = parts[24],
                                    PostalCode = parts[25],
                                    Country = parts[26],
                                    Longitude = parts[27],
                                    Latitude = parts[28]
                                }
                            }
                        }
                    };

                    db.Graduates.Add(graduate);
                    count++;
                }
                catch
                {
                    continue;
                }
            }

            db.SaveChanges();
            Console.WriteLine($"✅ Inserted {count} graduates.");
        }
    }
}
