output "alb_dns_name" {
  value = aws_lb.ecs_lb.dns_name
}

output "lb_sg_id" {
  value = aws_security_group.ecs_lb.id
}

output "frontend_tg_arn" {
  value = aws_lb_target_group.frontend.arn
}

output "catalog_tg_arn" {
  value = aws_lb_target_group.catalog.arn
}

output "cart_tg_arn" {
  value = aws_lb_target_group.cart.arn
}

output "listener_arn" {
  value = aws_lb_listener.http.arn
}
