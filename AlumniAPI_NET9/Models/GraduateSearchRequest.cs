namespace AlumniAPI.Models
{
    public class GraduateSearchRequest
    {
        public int Page { get; set; } = 1;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public int? AcademicEntryYear { get; set; }
        public int? GraduationYear { get; set; }
        public double? DegreeGrade { get; set; }
    }
}
