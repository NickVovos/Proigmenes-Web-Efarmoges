using Microsoft.EntityFrameworkCore;
using AlumniAPI.Models;

namespace AlumniAPI.Data
{
    public class AlumniDbContext : DbContext
    {
        public AlumniDbContext(DbContextOptions<AlumniDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Graduate> Graduates { get; set; }
        public DbSet<Employment> Employments { get; set; }
        public DbSet<Phone> Phones { get; set; }
        public DbSet<SocialMedia> SocialMedias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Graduate>().ToTable("graduates");
            modelBuilder.Entity<Employment>().ToTable("employments");
            modelBuilder.Entity<Phone>().ToTable("phones");
            modelBuilder.Entity<SocialMedia>().ToTable("socialmedias");

            // Configure Address as an owned type
            modelBuilder.Entity<Employment>().OwnsOne(e => e.Address);

            base.OnModelCreating(modelBuilder);
        }
    }
}
